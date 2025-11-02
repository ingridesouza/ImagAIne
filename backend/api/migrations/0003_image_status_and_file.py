from django.db import migrations, models


def populate_image_status(apps, schema_editor):
    Image = apps.get_model("api", "Image")

    for image in Image.objects.all():
        image_url = getattr(image, "image_url", "") or ""

        if image_url == "FAILED":
            image.status = "FAILED"
            image.image = None
        elif image_url == "GENERATING":
            image.status = "GENERATING"
            image.image = None
        elif image_url:
            normalized = image_url
            if normalized.startswith("/media/"):
                normalized = normalized[len("/media/") :]
            normalized = normalized.lstrip("/")
            image.image = normalized or None
            image.status = "READY"
        else:
            image.status = "GENERATING"
            image.image = None

        image.save()


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="image",
            name="image",
            field=models.ImageField(blank=True, null=True, upload_to=""),
        ),
        migrations.AddField(
            model_name="image",
            name="status",
            field=models.CharField(
                choices=[
                    ("GENERATING", "Generating"),
                    ("READY", "Ready"),
                    ("FAILED", "Failed"),
                ],
                default="GENERATING",
                max_length=20,
            ),
        ),
        migrations.RunPython(populate_image_status, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="image",
            name="image_url",
        ),
    ]
