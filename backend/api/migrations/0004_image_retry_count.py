from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0003_image_status_and_file"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.AddField(
                    model_name="image",
                    name="retry_count",
                    field=models.PositiveIntegerField(default=0),
                ),
            ],
            database_operations=[
                migrations.RunSQL(
                    sql="ALTER TABLE api_image ADD COLUMN IF NOT EXISTS retry_count integer;",
                    reverse_sql="ALTER TABLE api_image DROP COLUMN IF EXISTS retry_count;",
                ),
                migrations.RunSQL(
                    sql="ALTER TABLE api_image ALTER COLUMN retry_count SET DEFAULT 0;",
                    reverse_sql="ALTER TABLE api_image ALTER COLUMN retry_count DROP DEFAULT;",
                ),
                migrations.RunSQL(
                    sql="UPDATE api_image SET retry_count = 0 WHERE retry_count IS NULL;",
                    reverse_sql=migrations.RunSQL.noop,
                ),
                migrations.RunSQL(
                    sql="ALTER TABLE api_image ALTER COLUMN retry_count SET NOT NULL;",
                    reverse_sql="ALTER TABLE api_image ALTER COLUMN retry_count DROP NOT NULL;",
                ),
            ],
        ),
    ]

