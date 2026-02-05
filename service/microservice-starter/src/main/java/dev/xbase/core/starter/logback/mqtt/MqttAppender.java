package dev.xbase.core.starter.logback.mqtt;

import ch.qos.logback.core.Layout;
import ch.qos.logback.core.UnsynchronizedAppenderBase;
import ch.qos.logback.core.status.ErrorStatus;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;

import java.util.Objects;

public class MqttAppender<E> extends UnsynchronizedAppenderBase<E> {

  protected Layout<E> layout;
  private String brokerUrl;
  private String topic;
  private String clientId;
  private String username;
  private String password;
  private MqttClient client;

  private int minInterval = 5000;

  private int maxMessageSize = 1024;

  public void setLayout(Layout<E> layout) {
    this.layout = layout;
  }

  public void setBrokerUrl(String brokerUrl) {
    this.brokerUrl = brokerUrl;
  }

  public void setTopic(String topic) {
    this.topic = topic;
  }

  public void setClientId(String clientId) {
    this.clientId = clientId;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  @Override
  public void start() {
    int errors = 0;

    if (this.layout == null) {
      internalAddStatus("No layout set");
      errors++;
    }

    if (this.minInterval < 0) {
      internalAddStatus("Bad minInterval");
      errors++;
    }

    if (this.maxMessageSize <= 0) {
      internalAddStatus("Bad maxMessageSize");
      errors++;
    }

    if (errors == 0) {
      try {
        client = new MqttClient(brokerUrl, clientId);
        MqttConnectOptions options = getMqttConnectOptions();
        client.connect(options);
        super.start();
      } catch (MqttException e) {
        internalAddStatus("Failed to connect to MQTT broker");
      }
    }
  }

  private MqttConnectOptions getMqttConnectOptions() {
    MqttConnectOptions options = new MqttConnectOptions();
    if (Objects.nonNull(username) && Objects.nonNull(password)) {
      options.setUserName(username);
      options.setPassword(password.toCharArray());
    }
    options.setAutomaticReconnect(true);
    options.setKeepAliveInterval(60); // Ping every 60 seconds
    options.setConnectionTimeout(30); // Timeout after 30 seconds
    return options;
  }

  @Override
  public void stop() {
    try {
      if (Objects.nonNull(client) && client.isConnected()) {
        client.disconnect();
      }
    } catch (MqttException e) {
      internalAddStatus("Failed to disconnect from MQTT broker");
    }
    super.stop();
  }

  @Override
  protected void append(E eventObject) {
    if (!isStarted()) {
      return;
    }
    sendMessage(eventObject);
  }

  protected void sendMessage(E eventObject) {
    if (client != null && client.isConnected()) {
      try {
        String logMessage = layout.doLayout(eventObject);
        MqttMessage message = new MqttMessage(logMessage.getBytes());
        message.setQos(1);
        client.publish(topic, message);
      } catch (MqttException e) {
        internalAddStatus("Failed to publish log to MQTT broker");
      }
    } else {
      internalAddStatus("MQTT client is not connected, unable to publish log.");
    }
  }

  private static final String MSG_FORMAT = "%s for the appender named '%s'.";

  private void internalAddStatus(String msgPrefix) {
    addStatus(new ErrorStatus(String.format(MSG_FORMAT, msgPrefix, name), this));
  }
}
