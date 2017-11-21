# visibility-tool
  Tool providing visibility dependencies resolving (to use in UI interfaces. rbac systems, describing rules , etc)

# Usage
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
          'Country' =>      [1, '>', [ 'india' => 1,'usa' => 2, 'russia' => 3]],
          'Address' =>      [-2, '=']
       ]       
```

 2. You get current visibility as a product of current fields state
```php
    
      $tool = new \app\components\emotion\visibility\VisibilityTool(['map' => $vis]);
      $visibleFields = $tool->getVisibility(\filter_input(INPUT_POST));
```
 3. You use the calculated `$visibleFields` array later to build the interface
 4. Also there is javascript code on a for client-side calculations.
```js    
    var v = getVisibility(fieldsValues, visMap);
```
# Explanation
   The visibility map is built like "stairs".
 Visible elements are always on top above level of "0".
 There are visibility groups - the groups of dependent or not dependent element. You can add such groups as many as you wish.
 Each group consists of
```php
       $vis = [ 
        'group 1' => [
            'element 1' => [            // element key
            
                1,                      // initial level
                
                '>',                    // operation of comparation 
                                        // there are four available
                                        //    '>'  - element is visible if it's level is above base [default]
                                        //    '>=' - element is visible if it's level is above or equals base
                                        //    '='  - element is visible if it's level is equals base 
                                        //    '(\d+)..(\d+)' - element is visible if it's level is in between the first given number and the last given number
                                        
                ['a' => 1, 'b' => 5, ], // additional values map ( for lists for example)
                                        // it can be true or false also
                                        //      if it's true then element affects visibility of other elements in the group
                                        //      if it's false then it does not affect other elements visibility [default]
                                        
                0                       // default base [0 -default]
            ],
            // ...
        ],
        'group 2' => [
            'element 2' => [ 
                1,
                '>',
                ['a' => 1, 'b' => 5, ],
                0
            ]
            // ...
        ],
        // ...
   ];
       
```

 So, referring to our example the starting grid looks like: 
```
 visible elements 
 
   Username   Firstname   Lastname   Phone   Country (=="india")         level  "1"     [here is the initial level]
 ----------------------------------------------------------------------- zero level "0"
                                                                         level "-1"
   Address                                                               level "-2"
    
 invisible elements
```
 When the country changes to 'usa' the fields gains levels from the visibility map (2 in this case): 
```
 visible elements 
 
   Username   Firstname   Lastname   Phone   Country (=="india")         level  "1"
 -- Address ------------------------------------------------------------ zero level "0"
                                                                         level "-1"
                                                                         level "-2"
    
 invisible elements
```

# Overall
  The visibility tool can be used to build rather complex interfaces with less effort.
You just need to statically describe visibility map and give the current values to main `getVisibility` method.
  
  Also You can adopt this tool for building complicated access levels for users, which may be helpful in rbac systems, especially when defining different rules (like in Yii2).
  
# Note
  This is just an example of code - not an extension for Yii2. Maybe some day it would grow up to be an extension.
