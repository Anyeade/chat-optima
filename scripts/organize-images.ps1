param(
    [string]$InputFile = "../data/pexels-images.json",
    [string]$OutputDir = "../data/organized"
)

Write-Host "Processing Pexels image data..." -ForegroundColor Cyan

# Check if input file exists
if (-not (Test-Path $InputFile)) {
    Write-Host "Input file not found: $InputFile" -ForegroundColor Red
    exit 1
}

# Read the JSON data
try {
    $jsonContent = Get-Content $InputFile -Raw | ConvertFrom-Json
    Write-Host "Loaded data with $($jsonContent.total_images) images" -ForegroundColor Green
} catch {
    Write-Host "Error reading JSON file: $_" -ForegroundColor Red
    exit 1
}

# Create output directory structure
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Create subdirectories for each use case
$useCases = @("ecommerce", "backgrounds", "profiles")
foreach ($useCase in $useCases) {
    $useCaseDir = Join-Path $OutputDir $useCase
    if (-not (Test-Path $useCaseDir)) {
        New-Item -ItemType Directory -Path $useCaseDir -Force | Out-Null
    }
}

Write-Host "Organizing images by categories..." -ForegroundColor Yellow

# Process images by category
$categoryStats = @{}
$allCategories = @()

foreach ($image in $jsonContent.images) {
    $category = $image.category
    $useCase = $image.use_case
    
    if (-not $categoryStats.ContainsKey($category)) {
        $categoryStats[$category] = @{
            "use_case" = $useCase
            "count" = 0
            "images" = @()
        }
        $allCategories += $category
    }
    
    $categoryStats[$category].count++
    $categoryStats[$category].images += $image
}

# Generate category-specific JSON files
foreach ($category in $allCategories) {
    $categoryData = $categoryStats[$category]
    $useCase = $categoryData.use_case
    $sanitizedCategory = $category -replace '\s+', '_' -replace '[^a-zA-Z0-9_]', ''
    
    $categoryFile = Join-Path (Join-Path $OutputDir $useCase) "$sanitizedCategory.json"
    
    # Create organized data structure for the category
    $organizedData = @{
        "category" = $category
        "use_case" = $useCase
        "total_images" = $categoryData.count
        "id_range" = @{
            "start" = "$($sanitizedCategory.ToLower())_1"
            "end" = "$($sanitizedCategory.ToLower())_$($categoryData.count)"
        }
        "images" = $categoryData.images
    }
    
    # Write category file
    $organizedData | ConvertTo-Json -Depth 10 | Out-File $categoryFile -Encoding UTF8
    
    Write-Host "  $category ($useCase): $($categoryData.count) images" -ForegroundColor White
}

# Generate summary report
$summaryData = @{
    "generated_at" = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    "total_images" = $jsonContent.total_images
    "total_categories" = $allCategories.Count
    "use_cases" = @{}
    "categories" = @{}
}

# Group by use case
foreach ($useCase in $useCases) {
    $useCaseImages = $jsonContent.images | Where-Object { $_.use_case -eq $useCase }
    $useCaseCategories = ($useCaseImages | Select-Object -Property category -Unique).category
    
    $summaryData.use_cases[$useCase] = @{
        "total_images" = $useCaseImages.Count
        "categories" = $useCaseCategories
        "category_count" = $useCaseCategories.Count
    }
}

# Add category details
foreach ($category in $allCategories) {
    $categoryData = $categoryStats[$category]
    $sanitizedCategory = $category -replace '\s+', '_' -replace '[^a-zA-Z0-9_]', ''
    
    $summaryData.categories[$category] = @{
        "use_case" = $categoryData.use_case
        "image_count" = $categoryData.count
        "custom_id_prefix" = $sanitizedCategory.ToLower()
        "id_range" = "1-$($categoryData.count)"
        "file_location" = "$($categoryData.use_case)/$sanitizedCategory.json"
    }
}

# Write summary file
$summaryFile = Join-Path $OutputDir "summary.json"
$summaryData | ConvertTo-Json -Depth 10 | Out-File $summaryFile -Encoding UTF8

# Generate CSV for easy viewing
$csvData = @()
foreach ($category in $allCategories) {
    $categoryData = $categoryStats[$category]
    $sanitizedCategory = $category -replace '\s+', '_' -replace '[^a-zA-Z0-9_]', ''
    
    $csvData += [PSCustomObject]@{
        "Category" = $category
        "Use_Case" = $categoryData.use_case
        "Image_Count" = $categoryData.count
        "ID_Prefix" = $sanitizedCategory.ToLower()
        "ID_Range" = "1-$($categoryData.count)"
        "File_Location" = "$($categoryData.use_case)/$sanitizedCategory.json"
    }
}

$csvFile = Join-Path $OutputDir "categories_summary.csv"
$csvData | Export-Csv $csvFile -NoTypeInformation -Encoding UTF8

Write-Host "Processing completed!" -ForegroundColor Green
Write-Host "Output directory: $OutputDir" -ForegroundColor Cyan
Write-Host "Summary file: summary.json" -ForegroundColor Cyan
Write-Host "CSV summary: categories_summary.csv" -ForegroundColor Cyan

# Display summary statistics
Write-Host "Summary Statistics:" -ForegroundColor Yellow
Write-Host "  Total Images: $($jsonContent.total_images)" -ForegroundColor White
Write-Host "  Total Categories: $($allCategories.Count)" -ForegroundColor White

foreach ($useCase in $useCases) {
    $useCaseImages = $jsonContent.images | Where-Object { $_.use_case -eq $useCase }
    $useCaseCategories = ($useCaseImages | Select-Object -Property category -Unique).category
    Write-Host "  $($useCase.ToUpper()): $($useCaseImages.Count) images across $($useCaseCategories.Count) categories" -ForegroundColor White
}

Write-Host "Custom ID system implemented successfully!" -ForegroundColor Green