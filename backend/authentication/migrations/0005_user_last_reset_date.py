from django.db import migrations, models
from django.utils import timezone


def current_date():
    return timezone.now().date()


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0004_user_image_generation_count"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "ALTER TABLE authentication_user "
                        "ADD COLUMN IF NOT EXISTS last_reset_date date "
                        "NOT NULL DEFAULT CURRENT_DATE;"
                    ),
                    reverse_sql=(
                        "ALTER TABLE authentication_user "
                        "DROP COLUMN IF EXISTS last_reset_date;"
                    ),
                ),
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
