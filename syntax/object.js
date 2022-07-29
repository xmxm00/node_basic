var members = ['egoing', 'k8805', 'hoya'];

var roles = {
    'programmer': 'egoing',
    'designer': 'k8805',
    'manager': 'hoya'
}

for(var name in roles){ // get Key
    console.log('object =>', name, 'value =>', roles[name]);
}

