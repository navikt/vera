import subprocess
import unittest
from datetime import datetime
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from google.api_core.exceptions import ServiceUnavailable
from google.auth.exceptions import DefaultCredentialsError

import backup


class BackupTest(unittest.TestCase):
    def setUp(self):
        directory = self.enterContext(TemporaryDirectory())
        self.dump_path = Path(directory) / "dump.gz"
        self.enterContext(patch.object(backup, "DUMP_PATH", self.dump_path))
        self.kubectl = self.enterContext(patch("backup.subprocess.run"))
        self.client = self.enterContext(patch("backup.storage.Client"))
        self.blob = self.client.return_value.bucket.return_value.blob.return_value
        self.payload = b"\x1f\x8b\x00\xffmongodb archive"
        self.kubectl.side_effect = self.write_dump

    def write_dump(self, command, *, stdout, check):
        stdout.write(self.payload)

    def test_uploads_complete_binary_dump_before_removing_it(self):
        clock = self.enterContext(patch("backup.datetime"))
        clock.now.return_value = datetime(2026, 11, 25, 11, 48)

        def upload(filename):
            self.assertEqual(Path(filename).read_bytes(), self.payload)
            self.assertTrue(self.kubectl.call_args.kwargs["stdout"].closed)

        self.blob.upload_from_filename.side_effect = upload

        self.assertEqual(backup.main(), 0)

        self.assertEqual(
            self.kubectl.call_args.args[0],
            [
                "/usr/local/bin/kubectl",
                "exec",
                "vera-mongo-0",
                "-c",
                "mongod-container",
                "--",
                "mongodump",
                "--archive",
                "--gzip",
            ],
        )
        self.assertTrue(self.kubectl.call_args.kwargs["check"])
        self.client.return_value.bucket.assert_called_once_with("vera-backup-bckt")
        self.client.return_value.bucket.return_value.blob.assert_called_once_with(
            "dump_2026-11-25_11-48.gz"
        )
        self.blob.upload_from_filename.assert_called_once_with(str(self.dump_path))
        self.assertFalse(self.dump_path.exists())

    def test_dump_failure_never_attempts_an_upload(self):
        for error in (
            subprocess.CalledProcessError(1, "kubectl"),
            FileNotFoundError("kubectl"),
        ):
            with self.subTest(error=error):
                self.kubectl.side_effect = error

                self.assertEqual(backup.main(), 1)

                self.client.assert_not_called()

    def test_upload_failure_preserves_dump_and_returns_failure(self):
        self.blob.upload_from_filename.side_effect = ServiceUnavailable("upload failed")

        self.assertEqual(backup.main(), 1)

        self.assertEqual(self.dump_path.read_bytes(), self.payload)

    def test_missing_credentials_preserves_dump_and_returns_failure(self):
        self.client.side_effect = DefaultCredentialsError("credentials unavailable")

        self.assertEqual(backup.main(), 1)

        self.assertEqual(self.dump_path.read_bytes(), self.payload)
        self.blob.upload_from_filename.assert_not_called()


if __name__ == "__main__":
    unittest.main()
