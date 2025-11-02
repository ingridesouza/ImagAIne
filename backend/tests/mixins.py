import shutil
import tempfile

from django.test import override_settings


class TemporaryMediaMixin:
    """Provide a temporary MEDIA_ROOT for tests that touch file storage."""

    def setUp(self):
        super().setUp()
        self._temp_media = tempfile.mkdtemp()
        self._override_media = override_settings(MEDIA_ROOT=self._temp_media)
        self._override_media.enable()

    def tearDown(self):
        self._override_media.disable()
        shutil.rmtree(self._temp_media, ignore_errors=True)
        super().tearDown()
