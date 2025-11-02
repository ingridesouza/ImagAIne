from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0003_user_bio"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "ALTER TABLE authentication_user "
                        "ADD COLUMN IF NOT EXISTS image_generation_count integer NOT NULL DEFAULT 0;"
                    ),
                    reverse_sql=(
                        "ALTER TABLE authentication_user "
                        "DROP COLUMN IF EXISTS image_generation_count;"
                    ),
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="user",
                    name="image_generation_count",
                    field=models.PositiveIntegerField(default=0),
                ),
            ],
        ),
    ]
