import subprocess
import sys
from datetime import datetime
from pathlib import Path

from google.cloud import storage

DUMP_PATH = Path("/tmp/dump.gz")


def main():
    print("starting backup process", flush=True)
    try:
        with DUMP_PATH.open("wb") as dump:
            subprocess.run(
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
                stdout=dump,
                check=True,
            )
    except (OSError, subprocess.CalledProcessError) as error:
        print(f"failed to execute mongodump: {error}", file=sys.stderr)
        return 1

    backup_name = datetime.now().strftime("dump_%Y-%m-%d_%H-%M.gz")
    try:
        client = storage.Client()
        blob = client.bucket("vera-backup-bckt").blob(backup_name)
        blob.upload_from_filename(str(DUMP_PATH))
    except Exception as error:
        print(f"failed to upload backup to bucket: {error}", file=sys.stderr)
        return 1

    DUMP_PATH.unlink()
    print("backup process completed successfully")
    return 0


if __name__ == "__main__":
    sys.exit(main())
