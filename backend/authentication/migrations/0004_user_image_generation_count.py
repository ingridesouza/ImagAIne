from django.db import migrations, models

def add_image_generation_count(apps, schema_editor):
    if schema_editor.connection.vendor == "postgresql":
        schema_editor.execute(
            "ALTER TABLE authentication_user "
            "ADD COLUMN IF NOT EXISTS image_generation_count integer NOT NULL DEFAULT 0;"
        )
    else:
        User = apps.get_model("authentication", "User")
        field = models.PositiveIntegerField(default=0)
        field.set_attributes_from_name("image_generation_count")
        schema_editor.add_field(User, field)


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0003_user_bio"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(add_image_generation_count, migrations.RunPython.noop),
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
