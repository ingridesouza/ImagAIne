from django.db import migrations, models
from django.utils import timezone


def current_date():
    return timezone.now().date()


def add_last_reset_date(apps, schema_editor):
    if schema_editor.connection.vendor == "postgresql":
        schema_editor.execute(
            "ALTER TABLE authentication_user "
            "ADD COLUMN IF NOT EXISTS last_reset_date date "
            "NOT NULL DEFAULT CURRENT_DATE;"
        )
    else:
        User = apps.get_model("authentication", "User")
        field = models.DateField(default=current_date)
        field.set_attributes_from_name("last_reset_date")
        schema_editor.add_field(User, field)


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0004_user_image_generation_count"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(add_last_reset_date, migrations.RunPython.noop),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="user",
                    name="last_reset_date",
                    field=models.DateField(default=current_date),
                ),
            ],
        ),
    ]
