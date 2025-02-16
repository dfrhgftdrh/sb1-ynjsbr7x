/*
  # Manual Admin Role Update
  
  1. Changes
    - Updates specific user's role to admin
*/

UPDATE profiles
SET role = 'admin'
FROM auth.users
WHERE 
  auth.users.email = 'mahatosubashis3@gmail.com' 
  AND profiles.id = auth.users.id;