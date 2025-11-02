from django.db import migrations, models

def add_bio_column(apps, schema_editor):
    if schema_editor.connection.vendor == "postgresql":
        schema_editor.execute(
            "ALTER TABLE authentication_user "
            "ADD COLUMN IF NOT EXISTS bio text NOT NULL DEFAULT '';"
        )
    else:
        User = apps.get_model("authentication", "User")
        field = models.TextField(blank=True, default="")
        field.set_attributes_from_name("bio")
        schema_editor.add_field(User, field)



class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0002_user_verification_token"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(add_bio_column, migrations.RunPython.noop),
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
