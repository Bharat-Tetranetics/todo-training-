//insert intial table data here

//dataObject format
/* let dataObject = {
    menu: `INSERT INTO Menu (menu_name) VALUES ('Dashboard'), ('Settings'), ('Profile');`,
    subMenu: `INSERT INTO Submenu (menu_id, submenu_name) VALUES
    (1, 'Overview'),  
    (1, 'Analytics'), 
    (2, 'User Preferences'), 
    (2, 'Security Settings'), 
    (3, 'Edit Profile'), 
    (3, 'Account Info'); `
}; */

let dataObject = {};

//normalize the table names to lowercase
let normalizedDataObject = Object.keys(dataObject).reduce((acc, key) => {
  acc[key.toLowerCase()] = dataObject[key];
  return acc;
}, {});

module.exports = normalizedDataObject;
