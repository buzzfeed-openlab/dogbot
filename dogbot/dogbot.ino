Servo myservo;

int turnpos = 120;
int stoppos = 95;
int turndelay=500;

int servoset(String command) {
    myservo.write(turnpos);
    delay(turndelay);
    myservo.write(stoppos);
  }

int setdelay(String command) {
    char inputStr[64];
    command.toCharArray(inputStr,64);
    turndelay = atoi(inputStr);
    return turndelay;
}

void setup() {
    myservo.attach(D0);
    Particle.function("go", servoset);
    Particle.function("set", setdelay);
    Particle.subscribe("feed_dogs", myHandler, MY_DEVICES);
}

void myHandler(const char *event, const char *data) {
    myservo.write(turnpos);
    delay(turndelay);
    myservo.write(stoppos);
}
