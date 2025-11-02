from django.test.runner import DiscoverRunner


class DescriptiveTestRunner(DiscoverRunner):
    """Custom runner that prints clearer summaries and enables verbose output."""

    def run_tests(self, test_labels, extra_tests=None, **kwargs):
        if self.verbosity < 2:
            self.verbosity = 2
        return super().run_tests(test_labels, extra_tests=extra_tests, **kwargs)

    def suite_result(self, suite, result, **kwargs):
        summary = super().suite_result(suite, result, **kwargs)

        total = result.testsRun
        failures = len(result.failures)
        errors = len(result.errors)
        skipped = len(result.skipped)
        expected_failures = len(result.expectedFailures)
        unexpected_successes = len(result.unexpectedSuccesses)
        succeeded = (
            total
            - failures
            - errors
            - skipped
            - expected_failures
            - unexpected_successes
        )

        print("\nResumo dos testes")
        print("-" * 50)
        print(f"Total executado    : {total}")
        print(f"Aprovados          : {succeeded}")
        print(f"Falhas             : {failures}")
        print(f"Erros              : {errors}")
        print(f"Ignorados          : {skipped}")
        if expected_failures:
            print(f"Falhas esperadas   : {expected_failures}")
        if unexpected_successes:
            print(f"Sucessos surpresa  : {unexpected_successes}")

        if failures or errors:
            print("\nDetalhes")
            print("-" * 50)
            for test, err in result.failures:
                description = test.shortDescription() or str(test)
                print(f"[FAIL] {description}\n{err}")
            for test, err in result.errors:
                description = test.shortDescription() or str(test)
                print(f"[ERROR] {description}\n{err}")

        return summary
