# CodeFlex

An AI-powered development assistant designed to streamline developer workflows and improve code quality.

## 🚀 Overview

CodeFlex helps developers automate code review tasks and ensure implementations match requirements. It acts as an intelligent companion to reduce manual overhead and maintain consistent quality standards.

## 🎯 Current Features

### Code Review
- **Analyze merge/pull requests** for code quality, style conventions, and potential issues
- **Validate implementation against ticket requirements** to ensure proper feature delivery
- **Provide constructive feedback** with specific improvement suggestions

### Documentation
- **Generate comprehensive documentation** from merge request content
- **Produce well-structured Markdown** with code examples and technical details
- **Focus on specific documentation areas** based on your needs

## 💻 Installation

```bash
# Coming soon
npm install -g codeflex
```

## 📋 Usage Examples

```bash
# Review code quality
codeflex review -m MR-789 -p PROJECT-ID

# Validate implementation against Jira ticket requirements
codeflex ticket-review -m MR-789 -p PROJECT-ID

# Override Jira ticket ID
codeflex ticket-review -m MR-789 -p PROJECT-ID -j JIRA-123

# Generate documentation from a merge request
codeflex generate-docs -m MR-789 -p PROJECT-ID -o docs/feature.md

# Additional documentation options
codeflex generate-docs -m MR-789 -p PROJECT-ID --include-apis --include-code-examples --json

# Additional review options
--detail-level <basic|standard|thorough>  # Set review detail level
--focus <areas>                           # Focus on specific areas (comma-separated)
--ignore <patterns>                       # Ignore files matching patterns
--file                                    # Save results to file
--verbose                                 # Show detailed information
--project-guidelines <path>               # Path to project guidelines file
```

## 🚧 Future Enhancements

### Short-term Improvements
1. **Output Formatting** - Add `--format` parameter (json, markdown, html)
2. **CI/CD Integration** - Silent mode and exit codes for pipeline integration
3. **Custom Rule Configuration** - Configuration via `.codeflex.json` file
4. **Multilingual Output** - Generate reviews in different languages

### Future Features
1. **Automated Ticket Creation** from natural language descriptions
2. **Test Generation** based on ticket specifications
3. **Effort Estimation** for implementing tickets
4. **Regression Detection** by comparing PRs with bug history
5. **Security Analysis** to detect potential vulnerabilities

## 🛠️ Technical Architecture

- Command Line Interface (CLI) for seamless workflow integration
- Simple command structure: `codeflex <command> [options]`
- Integrates with GitHub, GitLab, and JIRA
