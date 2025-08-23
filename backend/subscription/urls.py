from django.urls import path
from authentication.views import UpgradeSubscriptionView

app_name = 'subscription'

urlpatterns = [
    path('upgrade/', UpgradeSubscriptionView.as_view(), name='upgrade-subscription'),
]
