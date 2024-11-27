import kafka-python

print("test")

from kafka import KafkaConsumer

consumer = KafkaConsumer('connect-test')
for msg in consumer:
    print (msg)

