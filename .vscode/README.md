# VS Code Settings

## Formatter Configuration

This workspace is configured to use **Prettier** as the default formatter.

### Install Prettier Extension

To use the configured formatter, install the Prettier extension:

1. Open VS Code Extensions (Ctrl+Shift+X / Cmd+Shift+X)
2. Search for: **"Prettier - Code formatter"** by Prettier
3. Click **Install**

VS Code should prompt you to install recommended extensions when you open the workspace.

### Alternative: Use ESLint as Formatter

If you prefer not to use Prettier, you can use ESLint instead:

1. Copy `.vscode/SETTINGS_FALLBACK.json` to `.vscode/settings.json`
2. Install ESLint extension: **"ESLint"** by Microsoft
3. Reload VS Code

### Manual Formatting

You can also format files manually using the command palette:

- **Format Document**: Shift+Alt+F (Windows/Linux) or Shift+Option+F (Mac)
- **Format Selection**: Ctrl+K Ctrl+F (Windows/Linux) or Cmd+K Cmd+F (Mac)

### Using Prettier from Command Line

The project also includes Prettier scripts:

```bash
# Format all files
pnpm run format

# Check formatting
pnpm run format:check
```

---

## Recommended Extensions

See `.vscode/extensions.json` for the full list of recommended extensions:

- **Prettier - Code formatter** (required for formatting)
- **ESLint** (recommended for linting)
- **Tailwind CSS IntelliSense** (recommended for Tailwind)
- **TypeScript and JavaScript Language Features** (built-in)
