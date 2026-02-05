import { Modal, Form, Input, InputNumber, Switch, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { EditFormProps, Location, SearchResult, ChargingStation } from './data.d';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import styles from './styles.module.less';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { FullscreenControl } from "react-leaflet-fullscreen";
import "react-leaflet-fullscreen/styles.css";
import DisableAttribute from "@/components/Map/DisableAttribute";
import LocationMarker from "@/components/Map/LocationMarker";
import L from 'leaflet';
import { debounce } from 'lodash';
import SearchControl from '../search-tab/SearchControl';

const customIcon = L.icon({
  iconUrl: '/images/leaflet/icons/charging-station-14-svgrepo-com_green.svg',
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

const EditForm: React.FC<EditFormProps> = ({ showForm, onFinish }) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [mapRef, setMapRef] = useState<L.Map | null>(null);

  const MapEvents = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setSelectedLocation({ lat, lng });
        form.setFieldsValue({
          latitude: lat,
          longitude: lng
        });

        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          if (response.data) {
            const address = response.data.display_name;
            form.setFieldsValue({ address });
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
        }
      }
    });
    return null;
  };

  useEffect(() => {
    if (showForm.visible) {
      if (showForm.action === 'UPDATE' && showForm.data) {
        const { pos, stationName, active, address, status } = showForm.data;

          setSelectedLocation({
            lat: pos.lat,
            lng: pos.lng
          });

          form.setFieldsValue({
            stationName,
            active,
            address,
            status,
            latitude: pos.lat,
            longitude: pos.lng,
          });

          if (mapRef) {
            setTimeout(() => {
              mapRef.setView([pos.lat, pos.lng], 15);
              mapRef.invalidateSize();
            }, 100);
          }

      } else {
        form.resetFields();
        setSelectedLocation(null);
        if (mapRef) {
          mapRef.setView([10.8231, 106.6297], 13);
          mapRef.invalidateSize();
        }
      }
    }
  }, [showForm.visible, showForm.data, showForm.action, form, mapRef]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedLocation) {
        message.error(t('Vui lòng chọn vị trí trên bản đồ'));
        return;
      }

      const stationData: ChargingStation = {
        ...(showForm.data || {}),
        stationId: showForm.action === 'ADD'
          ? `CS${Math.floor(Math.random() * 1000)}`
          : showForm.data?.stationId || '',
        stationName: values.stationName,
        status: showForm.action === 'ADD' ? 1 : showForm.data?.status || 1,
        active: values.active,
        address: values.address,
        pos: new L.LatLng(selectedLocation.lat, selectedLocation.lng)
      };

      onFinish(stationData);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const debouncedSearch = debounce(async (value: string) => {
    if (!value) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get<SearchResult[]>(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}`
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      message.error(t('Không thể tìm kiếm địa điểm'));
      setSearchResults([]);
    }
  }, 300);

  // Fix map rendering issue
  useEffect(() => {
    if (showForm.visible && mapRef) {
      const timer = setTimeout(() => {
        mapRef.invalidateSize();
      }, 100); // Increased timeout for better reliability

      return () => clearTimeout(timer);
    }
  }, [showForm.visible, mapRef]);

  return (
    <Modal
      title={showForm.action === 'ADD' ? t('Thêm trạm sạc') : t('Cập nhật trạm sạc')}
      open={showForm.visible}
      onOk={handleSubmit}
      onCancel={() => onFinish()}
      destroyOnClose
      width={1200}
    >
      <div className={styles.modalContent}>
        <div className={styles.formSection}>
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              name="stationName"
              label={t('Tên trạm')}
              rules={[{ required: true, message: t('Vui lòng nhập tên trạm') }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="address"
              label={t('Địa chỉ')}
              rules={[{ required: true, message: t('Vui lòng nhập địa chỉ') }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="latitude"
              label={t('Vĩ độ')}
              rules={[{ required: true, message: t('Vui lòng nhập vĩ độ') }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="longitude"
              label={t('Kinh độ')}
              rules={[{ required: true, message: t('Vui lòng nhập kinh độ') }]}
            >
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="active"
              label={t('Trạng thái hoạt động')}
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Form>
        </div>
        <div className={styles.mapSection}>
          <MapContainer
            center={selectedLocation
              ? [selectedLocation.lat, selectedLocation.lng]
              : [10.8231, 106.6297]}
            zoom={13}
            ref={setMapRef}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <SearchControl
              onLocationSelect={(location) => {
                setSelectedLocation(location);
                form.setFieldsValue({
                  latitude: location.lat,
                  longitude: location.lng,
                  address: location.address
                });
                mapRef?.setView([location.lat, location.lng], 16);
              }}
              onSearch={debouncedSearch}
              searchResults={searchResults}
            />
            <FullscreenControl position="topright" />
            <DisableAttribute />
            <div className={styles.container}>
              <LocationMarker/>
            </div>
            <MapEvents />
            {selectedLocation && (
              <Marker
                position={[selectedLocation.lat, selectedLocation.lng]}
                icon={customIcon}
              />
            )}
          </MapContainer>
        </div>
      </div>
    </Modal>
  );
};

export default EditForm;
