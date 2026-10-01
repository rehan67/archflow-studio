# Contributing to ArchFlow Studio

Thank you for your interest in improving ArchFlow Studio!

## Development Setup

1. Clone your fork:
   ```bash
   git clone https://github.com/rehan67/archflow-studio.git
   cd archflow-studio
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\Activate.ps1
   # macOS/Linux:
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r skills/archflow-studio/requirements.txt
   ```

## Running Tests

Run the test suite:
```bash
python -m unittest discover -s tests -v
```

## Running the Web Studio Locally

Simply open `web-studio/index.html` in your browser, or start a lightweight local web server:
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000/web-studio/`.
