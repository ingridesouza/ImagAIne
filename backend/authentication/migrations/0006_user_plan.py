from django.db import migrations, models


def add_plan_column(apps, schema_editor):
    if schema_editor.connection.vendor == "postgresql":
        schema_editor.execute(
            "ALTER TABLE authentication_user "
            "ADD COLUMN IF NOT EXISTS plan varchar(10) NOT NULL DEFAULT 'free';"
        )
    else:
        User = apps.get_model("authentication", "User")
        field = models.CharField(max_length=10, default="free")
        field.set_attributes_from_name("plan")
        schema_editor.add_field(User, field)


class Migration(migrations.Migration):

    dependencies = [
        ("authentication", "0005_user_last_reset_date"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(add_plan_column, migrations.RunPython.noop),
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
