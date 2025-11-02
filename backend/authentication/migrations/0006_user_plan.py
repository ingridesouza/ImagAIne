from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0005_user_last_reset_date"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql=(
                        "ALTER TABLE authentication_user "
                        "ADD COLUMN IF NOT EXISTS plan varchar(10) NOT NULL DEFAULT 'free';"
                    ),
                    reverse_sql=(
                        "ALTER TABLE authentication_user "
                        "DROP COLUMN IF EXISTS plan;"
                    ),
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="user",
                    name="plan",
                    field=models.CharField(default="free", max_length=10),
                ),
            ],
        ),
    ]
