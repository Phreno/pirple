for i in $(seq 1 20); 
do 
echo "creating user $i"
curl --location --request POST "http://localhost:3000/users" \
--header 'Content-Type: application/json' \
--data-raw "{
  \"firstName\": \"John\",
  \"lastName\": \"Doe\",
  \"phone\": \"00${i}\",
  \"password\": \"@Bépo1234\",
  \"tosAgreement\": true
}"
echo "... done"
echo
done