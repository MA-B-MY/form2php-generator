document.addEventListener('DOMContentLoaded', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  }, (injectionResults) => {
    let outputEl = document.getElementById('output');
    let messageEl = document.getElementById('message');
    
    // Inputs
    let tableInput = document.getElementById('tableName');
    let successInput = document.getElementById('successUrl');
    let errorInput = document.getElementById('errorUrl');
    let formSelect = document.getElementById('formSelect');
    let queryModeSelect = document.getElementById('queryMode');
    
    // UI Elements
    let routingRow = document.getElementById('routingRow');
    let optionsRow = document.getElementById('optionsRow');
    let toggleValidation = document.getElementById('toggleValidation');
    let toggleViewBtn = document.getElementById('toggleView');
    let pContainer = document.getElementById('progress-container');
    let pBar = document.getElementById('progress-bar');
    
    let formDataList = injectionResults[0]?.result;
    let typingTimer;
    let activeData = null; 
    let isSqlView = false;
    let includeValidation = false;

    if (!formDataList) {
      messageEl.textContent = "Form2PHP: No named inputs found.";
      messageEl.style.color = "#d32f2f"; 
      tableInput.style.display = "none";
      routingRow.style.display = "none";
      optionsRow.style.display = "none";
      toggleViewBtn.style.display = "none";
      return;
    }

    formSelect.style.display = "block";
    formDataList.forEach((data, index) => {
      let option = document.createElement('option');
      option.value = index;
      option.textContent = `Target: ${data.label}`;
      formSelect.appendChild(option);
    });

    activeData = formDataList[0];

    const updateCode = () => {
      if (!activeData) return;
      
      let tableName = tableInput.value.trim() || 'your_table_name';
      let sucUrl = successInput.value.trim();
      let errUrl = errorInput.value.trim();
      let isUpdate = queryModeSelect.value === 'update';
      let rawCode = "";
      
      if (isSqlView) {
        rawCode = activeData.sql;
      } else {
        if (isUpdate) {
            rawCode = includeValidation ? activeData.updateCodeValidated : activeData.updateCode;
        } else {
            rawCode = includeValidation ? activeData.codeValidated : activeData.code;
        }
      }

      let successReplacement = sucUrl 
        ? `header("Location: ${sucUrl}");\n    exit;` 
        : `// [!] TODO: Add success routing (e.g., header('Location: dashboard.php'); exit;)`;
        
      let errorReplacement = errUrl 
        ? `header("Location: ${errUrl}");\n    exit;` 
        : `die("An error occurred while saving the data.");`;

      let finalCode = rawCode
        .replace(/your_table_name/g, tableName)
        .replace(/\/\/ SUCCESS_ROUTING_PLACEHOLDER/g, successReplacement)
        .replace(/\/\/ ERROR_ROUTING_PLACEHOLDER/g, errorReplacement);
      
      outputEl.textContent = finalCode;
      outputEl.style.display = "block";
      
      pContainer.style.display = "block";
      pBar.style.width = "0%";
      messageEl.textContent = isSqlView ? "Generating SQL Schema..." : "Updating PHP...";
      messageEl.style.color = "#333";
      
      navigator.clipboard.writeText(finalCode).then(() => {
        setTimeout(() => pBar.style.width = "100%", 10);
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
          messageEl.textContent = "Copied! Ready to paste.";
          messageEl.style.color = "#2e7d32";
          pContainer.style.display = "none";
        }, 500); 
      });
    };

    // Listeners
    toggleValidation.addEventListener('change', (e) => { includeValidation = e.target.checked; if (!isSqlView) updateCode(); });
    queryModeSelect.addEventListener('change', updateCode);
    tableInput.addEventListener('input', updateCode);
    successInput.addEventListener('input', updateCode);
    errorInput.addEventListener('input', updateCode);
    formSelect.addEventListener('change', (e) => { activeData = formDataList[e.target.value]; updateCode(); });
    
    toggleViewBtn.addEventListener('click', () => {
      isSqlView = !isSqlView;
      if (isSqlView) {
        toggleViewBtn.textContent = "View PHP Code";
        toggleViewBtn.className = "btn";
        routingRow.style.display = "none";
        optionsRow.style.display = "none";
      } else {
        toggleViewBtn.textContent = "View SQL Schema";
        toggleViewBtn.className = "btn btn-sql";
        routingRow.style.display = "flex";
        optionsRow.style.display = "flex";
      }
      updateCode();
    });

    updateCode();
  });
});