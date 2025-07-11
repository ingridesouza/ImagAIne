#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'imagAine.settings')
    sys.path.append(os.path.dirname(__file__))
    from django.core.management import execute_from_command_line
    execute_from_command_line(sys.argv)
