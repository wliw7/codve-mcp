# @codve/mcp-server

MCP (Model Context Protocol) Server for [Codve](https://codve.ai) - AI code verification integration for Cursor, Cline, and other MCP-compatible clients.

## Features

- **codve.verify** - Verify code correctness using multi-strategy analysis
- **codve.fix_with_ai** - AI-powered code fixing with BYOK (Bring Your Own Key)
- **codve.reverify** - Re-verify code after applying patches
- **codve.health** - Check API connectivity status

## Installation

```bash
# Using npm
npm install -g @codve/mcp-server

# Using pnpm
pnpm add -g @codve/mcp-server

# Using yarn
yarn global add @codve/mcp-server
```

Or run directly with npx:

```bash
npx @codve/mcp-server
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CODVE_API_TOKEN` | Yes | - | Your Codve API key (get one at codve.ai/dashboard/api-keys) |
| `CODVE_API_BASE_URL` | No | `https://codve.ai` | Base URL for Codve API |
| `CODVE_TIMEOUT_MS` | No | `8000` | Request timeout in milliseconds |
| `DEBUG` | No | `0` | Set to `1` to enable debug logging to stderr |

### Setting Environment Variables

**macOS / Linux:**
```bash
export CODVE_API_TOKEN="vk_live_your_api_key_here"
export CODVE_TIMEOUT_MS="10000"
```

**Windows (PowerShell):**
```powershell
$env:CODVE_API_TOKEN = "vk_live_your_api_key_here"
$env:CODVE_TIMEOUT_MS = "10000"
```

**Windows (CMD):**
```cmd
set CODVE_API_TOKEN=vk_live_your_api_key_here
set CODVE_TIMEOUT_MS=10000
```

## MCP Client Configuration

### Cursor

Add to your Cursor settings (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "codve": {
      "command": "npx",
      "args": ["@codve/mcp-server"],
      "env": {
        "CODVE_API_TOKEN": "vk_live_your_api_key_here"
      }
    }
  }
}
```

### Cline (VS Code Extension)

Add to your Cline MCP settings:

```json
{
  "mcpServers": {
    "codve": {
      "command": "npx",
      "args": ["@codve/mcp-server"],
      "env": {
        "CODVE_API_TOKEN": "vk_live_your_api_key_here"
      }
    }
  }
}
```

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "codve": {
      "command": "npx",
      "args": ["@codve/mcp-server"],
      "env": {
        "CODVE_API_TOKEN": "vk_live_your_api_key_here"
      }
    }
  }
}
```

## Tools Reference

### codve.verify

Verify code correctness using Codve's multi-strategy analysis.

**Input:**
```json
{
  "language": "javascript",
  "code": "function add(a, b) { return a + b; }",
  "functionName": "add",
  "expectedBehavior": "Returns the sum of two numbers"
}
```

**Output:**
```json
{
  "tool": "codve.verify",
  "version": "1.0.0",
  "requestId": "req_abc123_xyz789",
  "status": "pass",
  "confidence": 94,
  "finding": "[symbolic] No issues detected; [property-based] Verified commutativity",
  "evidence": null,
  "suggested_actions": []
}
```

**Status Values:**
- `pass` - Code passed verification with high confidence (>=80%)
- `fail` - Concrete counterexample found or confidence <50%
- `inconclusive` - Could not determine correctness (timeout, missing info, etc.)

---

### codve.fix_with_ai

Use AI to fix code issues. Requires BYOK (Bring Your Own Key) for the AI provider.

**Input:**
```json
{
  "language": "javascript",
  "code": "function divide(a, b) { return a / b; }",
  "issue": "Division by zero not handled",
  "byok": {
    "provider": "openai",
    "apiKey": "sk-your-openai-key",
    "model": "gpt-4"
  }
}
```

**Output:**
```json
{
  "tool": "codve.fix_with_ai",
  "version": "1.0.0",
  "requestId": "req_def456_uvw012",
  "status": "success",
  "patch": "--- a/code\n+++ b/code\n@@ -1,1 +1,4 @@\n-function divide(a, b) { return a / b; }\n+function divide(a, b) {\n+  if (b === 0) throw new Error('Division by zero');\n+  return a / b;\n+}",
  "notes": "Confidence improved from 45% to 92%. Iterations: 1. Changes: Added zero check",
  "safety": "Patch NOT auto-applied. Review the diff and apply manually if appropriate."
}
```

**Supported Providers:**
- `openai` - OpenAI (GPT-4, GPT-3.5, etc.)
- `anthropic` - Anthropic (Claude)
- `custom` - Any OpenAI-compatible API (requires `baseUrl`)

---

### codve.reverify

Re-verify code after applying a patch to confirm the fix is valid.

**Input:**
```json
{
  "language": "javascript",
  "originalCode": "function divide(a, b) { return a / b; }",
  "patchedCode": "function divide(a, b) {\n  if (b === 0) throw new Error('Division by zero');\n  return a / b;\n}",
  "expectedBehavior": "Safely divides two numbers"
}
```

**Output:**
```json
{
  "tool": "codve.reverify",
  "version": "1.0.0",
  "requestId": "req_ghi789_rst345",
  "status": "pass",
  "confidence": 92,
  "finding": "[symbolic] Zero division handled; [constraint] Edge cases pass",
  "evidence": null,
  "suggested_actions": ["Patch appears safe to apply"]
}
```

---

### codve.health

Check Codve API connectivity and latency.

**Input:**
```json
{}
```

**Output:**
```json
{
  "tool": "codve.health",
  "version": "1.0.0",
  "requestId": "req_jkl012_mno678",
  "status": "ok",
  "codve_api_reachable": true,
  "base_url": "https://codve.ai",
  "latency_ms": 142
}
```

## Example Workflow

1. **Verify your code:**
   ```
   Use codve.verify to check function add(a, b) { return a + b; }
   ```

2. **If issues found, fix with AI:**
   ```
   Use codve.fix_with_ai with the issue from step 1
   ```

3. **Reverify the fix:**
   ```
   Use codve.reverify with original and patched code
   ```

4. **Apply the patch if verification passes**

## Troubleshooting

### "Request timed out"
- Increase `CODVE_TIMEOUT_MS` environment variable
- Try with smaller code snippets
- Check your network connection

### "API error 401"
- Verify your `CODVE_API_TOKEN` is correct
- Get a new API key at codve.ai/dashboard/api-keys

### "API error 402"
- Your Codve subscription may have expired
- Check your billing status at codve.ai/dashboard/billing

### No output / server not responding
- Ensure you're using stdio transport (default)
- Check stderr for error messages with `DEBUG=1`

## License

MIT

## Links

- [Codve Website](https://codve.ai)
- [API Documentation](https://codve.ai/docs)
- [Get API Key](https://codve.ai/dashboard/api-keys)
- [Pricing](https://codve.ai/pricing)
