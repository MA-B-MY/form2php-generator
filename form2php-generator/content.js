function extractAllForms() {
  let forms = document.querySelectorAll('form');
  let formList = [];
  let ignoreNames = ['remember_me', 'submit', 'login', 'register', 'btn'];

  const processInputs = (inputs, formLabel, actionUrl) => {
    let columns = [], bindVars = [], seenNames = [];
    let validationBlocks = [];
    let sqlColumns = [];

    let phpVars = "// 1. Capture POST Variables & Type Casting\n";

    inputs.forEach(input => {
      let name = input.getAttribute('name');
      if (!name) return;
      
      let lowerCaseName = name.toLowerCase();
      if (ignoreNames.includes(lowerCaseName) || seenNames.includes(name) || input.type === 'submit' || input.type === 'button') return;
      seenNames.push(name);
      
      let inputType = input.type ? input.type.toLowerCase() : 'text';
      let isRequired = input.required || input.hasAttribute('required');
      
      if (inputType === 'number') {
        phpVars += `$${name} = isset($_POST['${name}']) ? (int) $_POST['${name}'] : 0;\n`;
        sqlColumns.push(`    ${name} INT`);
        if (isRequired) validationBlocks.push(`if ($${name} === 0) {\n    die("${name} is required.");\n}`);
        else validationBlocks.push(`// if ($${name} === 0) {\n//     die("${name} is required.");\n// }`);
      } else if (inputType === 'checkbox') {
        phpVars += `$${name} = isset($_POST['${name}']) ? 1 : 0;\n`;
        sqlColumns.push(`    ${name} TINYINT(1) DEFAULT 0`);
      } else {
        phpVars += `$${name} = trim($_POST['${name}'] ?? '');\n`;
        sqlColumns.push(`    ${name} VARCHAR(255)`);
        if (isRequired) validationBlocks.push(`if (empty($${name})) {\n    die("${name} is required.");\n}`);
        else validationBlocks.push(`// if (empty($${name})) {\n//     die("${name} is required.");\n// }`);
      }
      
      columns.push(name);
      bindVars.push(`        ':${name}' => $${name}`);
    });

    if (columns.length === 0) return null;

    let pdoPlaceholders = columns.map(c => `:${c}`).join(', ');
    let updateSet = columns.map(c => `${c} = :${c}`).join(', ');

    // --- INSERT LOGIC ---
    let phpPdoInsert = "try {\n";
    phpPdoInsert += "    // Assume $pdo connection is already established\n";
    phpPdoInsert += `    $sql = "INSERT INTO logim.your_table_name (${columns.join(', ')}) VALUES (${pdoPlaceholders})";\n`;
    phpPdoInsert += `    $stmt = $pdo->prepare($sql);\n`;
    phpPdoInsert += `    $stmt->execute([\n${bindVars.join(',\n')}\n    ]);\n\n`;
    phpPdoInsert += "    // SUCCESS_ROUTING_PLACEHOLDER\n";
    phpPdoInsert += "} catch (PDOException $e) {\n";
    phpPdoInsert += "    error_log(\"Database Error: \" . $e->getMessage());\n";
    phpPdoInsert += "    // ERROR_ROUTING_PLACEHOLDER\n";
    phpPdoInsert += "}\n";

    // --- UPDATE LOGIC ---
    let bindVarsUpdate = [...bindVars];
    let phpVarsUpdate = phpVars;
    if (!columns.includes('id')) {
        phpVarsUpdate += `$id = $_POST['id'] ?? 0; // [!] TODO: Ensure $id is provided for the WHERE clause\n`;
        bindVarsUpdate.push(`        ':id' => $id`);
    }

    let phpPdoUpdate = "try {\n";
    phpPdoUpdate += "    // Assume $pdo connection is already established\n";
    phpPdoUpdate += `    $sql = "UPDATE logim.your_table_name SET ${updateSet} WHERE id = :id";\n`;
    phpPdoUpdate += `    $stmt = $pdo->prepare($sql);\n`;
    phpPdoUpdate += `    $stmt->execute([\n${bindVarsUpdate.join(',\n')}\n    ]);\n\n`;
    phpPdoUpdate += "    // SUCCESS_ROUTING_PLACEHOLDER\n";
    phpPdoUpdate += "} catch (PDOException $e) {\n";
    phpPdoUpdate += "    error_log(\"Database Error: \" . $e->getMessage());\n";
    phpPdoUpdate += "    // ERROR_ROUTING_PLACEHOLDER\n";
    phpPdoUpdate += "}\n";

    // --- COMPILE ALL VARIATIONS ---
    let buildPhp = (vars, pdo, withValidation) => {
        let code = "<?php\n\n";
        if (actionUrl) code += `// Target Action File: ${actionUrl}\n\n`;
        code += vars + "\n";
        if (withValidation && validationBlocks.length > 0) {
            code += "// 1.5 Validation (Uncomment optional fields if needed)\n" + validationBlocks.join("\n") + "\n\n";
        } else if (!withValidation) {
            code += "// [!] TODO: Add validation logic here\n\n";
        }
        code += pdo + "\n?>";
        return code;
    };

    let sqlCode = "-- Create a database first\n";
    sqlCode += "-- Below is the SQL query to create database. remove the two minus symbol in front to use it\n";
    sqlCode += "-- logim is the database name. You can change it to your desire\n";
    sqlCode += "-- CREATE DATABASE IF NOT EXISTS logim;\n";
    sqlCode += "-- USE logim;\n\n";
    sqlCode += "CREATE TABLE your_table_name (\n";
    sqlCode += "    id INT AUTO_INCREMENT PRIMARY KEY,\n";
    sqlCode += sqlColumns.join(",\n") + ",\n";
    sqlCode += "    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n";
    sqlCode += ");";

    return { 
      label: formLabel, 
      code: buildPhp(phpVars, phpPdoInsert, false), 
      codeValidated: buildPhp(phpVars, phpPdoInsert, true), 
      updateCode: buildPhp(phpVarsUpdate, phpPdoUpdate, false),
      updateCodeValidated: buildPhp(phpVarsUpdate, phpPdoUpdate, true),
      sql: sqlCode 
    };
  }; 

  if (forms.length > 0) {
    forms.forEach((form, index) => {
      let inputs = form.querySelectorAll('input[name], select[name], textarea[name]');
      let actionUrl = form.getAttribute('action') || 'Self (Current Page)';
      let data = processInputs(inputs, form.id || form.name || `Form ${index + 1}`, actionUrl);
      if (data) formList.push(data);
    });
  } else {
    let allInputs = document.querySelectorAll('input[name], select[name], textarea[name]');
    let data = processInputs(allInputs, "All Page Inputs", null);
    if (data) formList.push(data);
  }

  return formList.length > 0 ? formList : null;
}
extractAllForms();