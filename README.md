# Form2PHP Backend Generator 🚀

**Form2PHP** is a Google Chrome extension designed to instantly generate complete, production-ready PHP PDO backend logic, field validation, dynamic routing, and SQL schemas directly from HTML form fields[cite: 1, 2].

> [!NOTE]  
> **Project History:** This project was originally created around the end of August 2026 but I forgor to put it in here

---

## ⚡ Core Features

- 🎯 **Multi-Form Detection:** Scans the active browser tab for HTML `<form>` elements and input lists[cite: 1]. If multiple forms exist, a dropdown lets you target specific forms[cite: 3, 4].
- 🔄 **INSERT & UPDATE Modes:** Instantly toggle between generating `INSERT INTO` queries or `UPDATE` queries (with automatic `WHERE id = :id` logic)[cite: 1, 3, 4].
- 🛡️ **Optional Field Validation:** Toggle automatic PHP input validation (e.g., `empty()` and required check warnings)[cite: 1, 3, 4].
- 🔀 **Dynamic Success/Error Routing:** Enter target URLs (e.g., `dashboard.php` or `fail.php`) in the popup to automatically generate `header("Location: ...")` redirect blocks[cite: 1, 3, 4].
- 🗄️ **Automatic SQL Schema Generation:** Includes a built-in SQL generator to create `CREATE TABLE` scripts based on detected form field names and data types (e.g., `VARCHAR`, `INT`, `TINYINT`)[cite: 1, 3, 4].
- 📋 **Auto-Copy to Clipboard:** Generated PHP or SQL code is copied directly to your clipboard upon selection[cite: 4].

---

## 🛠️ Project Structure

- `manifest.json` — Chrome Extension Manifest (V3 configuration)[cite: 2].
- `content.js` — DOM injection script that scans `<form>`, `<input>`, `<select>`, and `<textarea>` elements and constructs PHP PDO & SQL boilerplate[cite: 1, 4].
- `popup.html` & `popup.js` — Extension UI controls for managing database table names, routing paths, validation toggles, and view modes[cite: 3, 4].

---

## 📥 Installation

1. Download or clone this repository to your local computer.
2. Open Google Chrome and go to `[chrome://extensions/](https://chromewebstore.google.com/detail/form2php-backend-generato/hlebbdfhanpofmjphhhmckppnaffoodf)`.
3. Enable **Developer mode** using the toggle switch in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the `Form2PHP` extension directory.
