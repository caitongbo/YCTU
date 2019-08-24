<?php

$host = 'jwzx.cqu.pt';
$url = 'http://' . $host;

$ch = curl_init();

$options = array(
    CURLOPT_URL => $url,
    CURLOPT_HEADER => false,
    CURLOPT_NOBODY => true,
    CURLOPT_TIMEOUT => 8
);

curl_setopt_array( $ch, $options );

curl_exec( $ch );

$ip = gethostbyname( $host );
$ping = curl_getinfo( $ch, CURLINFO_CONNECT_TIME );
$code = curl_getinfo( $ch, CURLINFO_HTTP_CODE );

echo json_encode( [ $ip, ceil($ping * 1000), $code ] );

curl_close( $ch );

?>