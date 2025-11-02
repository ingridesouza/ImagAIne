from django.db import migrations, models


def add_profile_picture(apps, schema_editor):
    if schema_editor.connection.vendor == "postgresql":
        schema_editor.execute(
            "ALTER TABLE authentication_user "
            "ADD COLUMN IF NOT EXISTS profile_picture varchar(100);"
        )
    else:
        User = apps.get_model("authentication", "User")
        field = models.CharField(max_length=100, blank=True, null=True)
        field.set_attributes_from_name("profile_picture")
        schema_editor.add_field(User, field)


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0007_user_social_media_links"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(add_profile_picture, migrations.RunPython.noop),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="user",
                    name="profile_picture",
                    field=models.CharField(blank=True, max_length=100, null=True),
                ),
            ],
        ),
    ]
