from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import sys

backend_path = Path(__file__).resolve().parent / "tee-backend" / "main.py"
backend_spec = spec_from_file_location("mindvault_tee_backend_main", backend_path)
if backend_spec is None or backend_spec.loader is None:
    raise RuntimeError(f"Unable to load backend app from {backend_path}")

backend_module = module_from_spec(backend_spec)
sys.modules[backend_spec.name] = backend_module
backend_spec.loader.exec_module(backend_module)

app = backend_module.app
