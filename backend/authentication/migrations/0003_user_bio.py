from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0002_user_verification_token"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "ALTER TABLE authentication_user "
                        "ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '';"
                    ),
                    reverse_sql=(
                        "ALTER TABLE authentication_user "
                        "DROP COLUMN IF EXISTS bio;"
                    ),
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="user",
                    name="bio",
                    field=models.TextField(blank=True, default=""),
                ),
            ],
        ),
    ]
