# visibility-tool
Tool providing simple visibility dependencies resolving to use in UI interfaces. rbac systems (describing roles) , etc

usage:
Let's imagine the user interface with some fields to fill. 
For example user registration form with some options.
 * Username
 * Firstname
 * Lastname
 * Phone
 * Country (list of countries)
 * and optionally we have  fields which are dependent from Country
    if country is USA then additionally ask for address information
      
The core idea is simple 
 1. You describe an array of field groups with dependencies
    (explanation of what values means, later)
```php
       $vis = [
       [  'Username' =>     [1],
          'Firstname' =>    [1],
          'Lastname' =>     [1],
          'Phone' =>        [1],
       ],
       [
          'Country' =>      [1, '>', ['usa' => 1, 'india' => 2, 'russia' => 3]],
          'Address' =>      [-1, '=']
       ]       
```

 2. You get current visibility as a product of current fields state
```php
    
      $tool = new \app\components\emotion\visibility\VisibilityTool(['map' => $vis]);
      $visibleFields = $tool->getVisibility(\filter_input(INPUT_POST));
```
 3. You use the calculated `$visibleFields` array later to build the interface
 4. Also there is doubling code on client-side
```js    
    var v = getVisibility(fieldsValues, visMap);
```
