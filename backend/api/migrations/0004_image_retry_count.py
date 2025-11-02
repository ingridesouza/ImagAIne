from django.db import migrations, models


def add_retry_count_field(apps, schema_editor):
    Image = apps.get_model("api", "Image")
    if schema_editor.connection.vendor == "postgresql":
        statements = [
            "ALTER TABLE api_image ADD COLUMN IF NOT EXISTS retry_count integer;",
            "ALTER TABLE api_image ALTER COLUMN retry_count SET DEFAULT 0;",
            "UPDATE api_image SET retry_count = 0 WHERE retry_count IS NULL;",
            "ALTER TABLE api_image ALTER COLUMN retry_count SET NOT NULL;",
        ]
        for statement in statements:
            schema_editor.execute(statement)
    else:
        field = models.PositiveIntegerField(default=0)
        field.set_attributes_from_name("retry_count")
        schema_editor.add_field(Image, field)


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
                migrations.RunPython(add_retry_count_field, migrations.RunPython.noop),
            ],
        ),
    ]
