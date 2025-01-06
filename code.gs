/**
 * Author: Dayanidi Vadivel
 * GitHub: https://github.com/dayanidigv/
 * Description: This script updates the README and progress bar on GitHub with a countdown to the end of the year.
 */



/**
 * Set your GitHub repository details and token here.
 */
const GITHUB_TOKEN = 'your_github_token_here';
const GITHUB_OWNER = 'your_github_username_here'; 
const GITHUB_REPO = 'your_repo_name_here';
const README_PATH = 'readme_file_path_here';
const PROGRESS_BAR_PATH = 'your_svg_file_name_here';

/**
 * Main function to calculate countdown and update README.
 */
async function updateReadmeWithCountdown() {
  try {
    const today = new Date();
    const endOfYear = new Date(today.getFullYear(), 11, 31);
    const totalDays = (endOfYear - new Date(today.getFullYear(), 0, 1)) / (1000 * 60 * 60 * 24);
    const remainingDays = Math.ceil((endOfYear - today) / (1000 * 60 * 60 * 24));
    const completedDays = totalDays - remainingDays;
    const percentageCompleted = ((completedDays / totalDays) * 100).toFixed(2);
    
    // Generate README content with dynamic elements.
    const readmeContent = generateReadmeContent(remainingDays, percentageCompleted, today);

    await updateSVG(percentageCompleted);
    await updateGitHubReadme(readmeContent);

    Logger.log('Successfully updated the README and progress bar.');
  } catch (error) {
    Logger.log(`Error updating README or SVG: ${error.message}`);
  }
}

/**
 * Generate the content for the README.
 */
function generateReadmeContent(remainingDays, percentageCompleted, today) {
  return `
# &#x1F570; **Year Countdown Progress** &#x1F389;.

## &#x1F4C5; Countdown to the end of ${today.getFullYear()}:
- **${remainingDays} days remaining** &#x23F3;
- **${percentageCompleted}% of the year completed** &#x1F4CA;

---

## &#x1F525; **Progress Visualization**:

**Current Year Progress:**

<br><br>
![Progress Bar](https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${PROGRESS_BAR_PATH})
<br><br>

**${percentageCompleted}%**
---

## &#x1F4C8; **Daily Updates**:

_Last updated: **${today.toDateString()}**_

Stay motivated as the year progresses! &#x1F680;

--- 

### &#x1F4A1; **Fun Fact:**
The year is steadily ticking by, but remember, the best part of the year is yet to come! &#x1F31F;
---
`;
}

/**
 * Update the SVG file with the progress bar.
 */
async function updateSVG(percentageCompleted) {
  try {
    const progressBarWidth = (500 * percentageCompleted) / 100;
    const progressBarColor = getProgressBarColor(percentageCompleted);

    const svgContent = createSVG(progressBarWidth, progressBarColor, percentageCompleted);

    // Fetch the existing file details
    const fileData = await fetchFileData(PROGRESS_BAR_PATH);
    const sha = fileData.sha;

    const payload = {
      message: `Update SVG with countdown for ${new Date().toDateString()}`,
      content: Utilities.base64Encode(svgContent),
      sha: sha // Required for updating files
    };

    // Update the file
    await updateFile(PROGRESS_BAR_PATH, payload);
  } catch (error) {
    Logger.log(`Error updating SVG: ${error.message}`);
  }
}

/**
 * Helper function to determine the color based on progress.
 */
function getProgressBarColor(percentage) {
  if (percentage <= 50) {
    return "#4caf50";  // Green
  } else if (percentage <= 80) {
    return "#ffeb3b";  // Yellow
  } else {
    return "#f44336";  // Red
  }
}

/**
 * Create SVG content dynamically.
 */
function createSVG(progressBarWidth, progressBarColor, percentageCompleted) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="40">
      <rect x="0" y="0" width="500" height="40" fill="#262C36" />
      <rect x="0" y="0" width="${progressBarWidth}" height="40" fill="${progressBarColor}" />
      <text x="250" y="20" text-anchor="middle" alignment-baseline="middle" font-size="14" fill="white">
        ${percentageCompleted}% Completed
      </text>
    </svg>
  `;
}

/**
 * Fetch the file data (like SHA) from GitHub repository.
 */
async function fetchFileData(filePath) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
  const options = {
    method: 'get',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json'
    }
  };

  const response = await UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText());
}

/**
 * Update a file in the GitHub repository.
 */
async function updateFile(filePath, payload) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
  const options = {
    method: 'put',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json'
    },
    payload: JSON.stringify(payload)
  };

  const response = await UrlFetchApp.fetch(url, options);
  Logger.log(`File updated: ${response.getContentText()}`);
}

/**
 * Update the README file in the GitHub repository.
 */
async function updateGitHubReadme(content) {
  try {
    const fileData = await fetchFileData(README_PATH);
    const sha = fileData.sha;

    const payload = {
      message: `Update README with countdown for ${new Date().toDateString()}`,
      content: Utilities.base64Encode(content),
      sha: sha // Required for updating files
    };

    await updateFile(README_PATH, payload);
  } catch (error) {
    Logger.log(`Error updating README: ${error.message}`);
  }
}

/**
 * Schedule the script to run daily.
 */
function createDailyTrigger() {
  ScriptApp.newTrigger('updateReadmeWithCountdown')
    .timeBased()
    .everyDays(1)
    .atHour(0)
    .create();
}
