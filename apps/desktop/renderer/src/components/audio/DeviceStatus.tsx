type DeviceStatusProps = {
  microphonesCount: number;
  outputDevicesCount: number;
  permissionGranted: boolean;
  supportsOutputSelection: boolean;
};

export function DeviceStatus({
  microphonesCount,
  outputDevicesCount,
  permissionGranted,
  supportsOutputSelection,
}: DeviceStatusProps) {
  return (
    <div className="device-status">
      <div className="device-status__item">
        <span className="device-status__label">Mic permission</span>
        <strong className={`device-status__value ${permissionGranted ? 'is-ready' : 'is-muted'}`}>
          {permissionGranted ? 'Granted' : 'Not granted'}
        </strong>
      </div>
      <div className="device-status__item">
        <span className="device-status__label">Microphones</span>
        <strong className="device-status__value">{microphonesCount}</strong>
      </div>
      <div className="device-status__item">
        <span className="device-status__label">Output devices</span>
        <strong className="device-status__value">{outputDevicesCount}</strong>
      </div>
      <div className="device-status__item">
        <span className="device-status__label">Output support</span>
        <strong className={`device-status__value ${supportsOutputSelection ? 'is-ready' : 'is-muted'}`}>
          {supportsOutputSelection ? 'Available' : 'Limited'}
        </strong>
      </div>
    </div>
  );
}
