# Assets Directory

This directory contains static assets and data files used by the ReceiptShield application.

## Structure

```
assets/
└── data/           # Data files and datasets
    └── *.traineddata  # OCR training data (Tesseract)
```

## Contents

### `/data`

Contains data files required for various features:

#### OCR Training Data

- **File**: `eng.traineddata`
- **Purpose**: English language training data for Tesseract OCR
- **Usage**: Receipt text extraction
- **Size**: ~10MB (excluded from git via .gitignore)

**Download**: If missing, download from:
```bash
wget https://github.com/tesseract-ocr/tessdata/raw/main/eng.traineddata -P assets/data/
```

## Adding New Assets

When adding new assets:

1. **Organize by type**: Create subdirectories for different asset types
   - `data/` - Data files
   - `images/` - Static images (if needed)
   - `fonts/` - Custom fonts (if needed)

2. **Update .gitignore**: Large files should be excluded from version control
   ```gitignore
   /assets/data/*.traineddata
   /assets/data/*.model
   ```

3. **Document in this README**: Add information about:
   - What the asset is
   - Why it's needed
   - How to obtain it (if not in repo)
   - File size and format

4. **Provide alternatives**: If assets are large:
   - Add download scripts
   - Document where to get them
   - Provide checksums for verification

## Asset Guidelines

### Size Considerations

- **< 1MB**: Can be committed to repo
- **1-10MB**: Consider adding to .gitignore, provide download instructions
- **> 10MB**: Must be excluded, use CDN or external storage

### Security

- Never commit sensitive data
- No API keys, tokens, or credentials
- Review files before committing

### Licensing

Ensure all assets have proper licenses for use:
- Document asset sources
- Include license information
- Verify redistribution rights

## Related Documentation

- [ML Module Documentation](../ml/README.md) - For ML-related assets
- [Development Guide](../CONTRIBUTING.md) - Asset contribution guidelines
- [.gitignore](../.gitignore) - Asset exclusion rules

## Maintenance

Assets should be:
- Periodically reviewed for relevance
- Updated when newer versions available
- Removed if no longer needed
- Documented with version information

---

**Note**: This directory is for application assets only. User-uploaded files (receipts, documents) are stored in Firebase Storage, not here.

