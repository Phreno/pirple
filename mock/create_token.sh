ID=${1-"000"}
PASSWORD=${2-"@Bépo1234"}
curl --location --request POST 'http://localhost:3000/tokens' \
--header 'Content-Type: application/json' \
--data-raw "{
  \"phone\": \"$ID\",
  \"password\": \"$PASSWORD\"
}"
echo