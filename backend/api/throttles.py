from django.conf import settings
from django.utils import timezone
from rest_framework.throttling import BaseThrottle


class PlanQuotaThrottle(BaseThrottle):
    """Enforce per-plan monthly generation quotas."""

    def allow_request(self, request, view):
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return True

        quotas = getattr(settings, "PLAN_QUOTAS", {})
        quota = quotas.get(getattr(user, "plan", "free"))
        if quota is None:
            return True

        today = timezone.now().date()
        period_start = today.replace(day=1)
        if getattr(user, "last_reset_date", None) != period_start:
            return True

        return getattr(user, "image_generation_count", 0) < quota
