# Push to GitHub Script
# Run this after creating your GitHub repository

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Weight Loss Tracker - Push to GitHub" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if remote already exists
$remoteExists = git remote get-url origin 2>$null

if ($remoteExists) {
    Write-Host "✓ GitHub remote already configured" -ForegroundColor Green
    Write-Host "  Remote URL: $remoteExists" -ForegroundColor Gray
    Write-Host ""
    
    # Just push
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ Push failed. You may need to:" -ForegroundColor Red
        Write-Host "  1. Create a Personal Access Token at: https://github.com/settings/tokens" -ForegroundColor Yellow
        Write-Host "  2. Use the token as your password when prompted" -ForegroundColor Yellow
    }
} else {
    Write-Host "First time setup - Please enter your GitHub repository URL" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example: https://github.com/noreriifnnorazaman/weight-loss-tracker-klinik-anda.git" -ForegroundColor Gray
    Write-Host ""
    
    $repoUrl = Read-Host "Enter your GitHub repository URL"
    
    if ($repoUrl) {
        Write-Host ""
        Write-Host "Adding remote and pushing..." -ForegroundColor Yellow
        
        git remote add origin $repoUrl
        git branch -M main
        git push -u origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Cyan
            Write-Host "  1. Set up Google Sheets API (see DEPLOY_INSTRUCTIONS.md)" -ForegroundColor White
            Write-Host "  2. Deploy to Render (see DEPLOY_INSTRUCTIONS.md)" -ForegroundColor White
        } else {
            Write-Host ""
            Write-Host "✗ Push failed. Please:" -ForegroundColor Red
            Write-Host "  1. Make sure you created the repository on GitHub" -ForegroundColor Yellow
            Write-Host "  2. Create a Personal Access Token at: https://github.com/settings/tokens" -ForegroundColor Yellow
            Write-Host "  3. Use the token as your password when prompted" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✗ No URL provided. Exiting." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Read-Host "Press Enter to exit"
