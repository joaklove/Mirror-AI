import React, { useState, useEffect, useRef } from 'react';

interface DeviceProfile {
  name: string;
  width: number;
  height: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
}

const deviceProfiles: DeviceProfile[] = [
  { name: 'iPhone SE', width: 375, height: 667, deviceType: 'mobile', orientation: 'portrait' },
  { name: 'iPhone 12', width: 390, height: 844, deviceType: 'mobile', orientation: 'portrait' },
  { name: 'iPad Mini', width: 768, height: 1024, deviceType: 'tablet', orientation: 'portrait' },
  { name: 'iPad Pro', width: 1024, height: 1366, deviceType: 'tablet', orientation: 'portrait' },
  { name: 'Desktop Small', width: 1024, height: 768, deviceType: 'desktop', orientation: 'landscape' },
  { name: 'Desktop Medium', width: 1280, height: 800, deviceType: 'desktop', orientation: 'landscape' },
  { name: 'Desktop Large', width: 1920, height: 1080, deviceType: 'desktop', orientation: 'landscape' },
  { name: 'iPhone SE (横屏)', width: 667, height: 375, deviceType: 'mobile', orientation: 'landscape' },
  { name: 'iPad Mini (横屏)', width: 1024, height: 768, deviceType: 'tablet', orientation: 'landscape' },
  { name: '4K Monitor', width: 3840, height: 2160, deviceType: 'desktop', orientation: 'landscape' },
];

interface ResponsiveTesterProps {
  className?: string;
  targetUrl?: string;
}

export function ResponsiveTester({ className, targetUrl = '/' }: ResponsiveTesterProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceProfile>(deviceProfiles[0]);
  const [customWidth, setCustomWidth] = useState(375);
  const [customHeight, setCustomHeight] = useState(667);
  const [isCustom, setIsCustom] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.src = targetUrl;
    }
  }, [targetUrl]);

  const handleDeviceChange = (device: DeviceProfile) => {
    setSelectedDevice(device);
    setIsCustom(false);
  };

  const handleCustomSizeChange = () => {
    setIsCustom(true);
  };

  const handleOrientationToggle = () => {
    if (isCustom) {
      const temp = customWidth;
      setCustomWidth(customHeight);
      setCustomHeight(temp);
    } else {
      const temp = selectedDevice.width;
      setSelectedDevice({
        ...selectedDevice,
        width: selectedDevice.height,
        height: temp,
        orientation: selectedDevice.orientation === 'portrait' ? 'landscape' : 'portrait',
      });
    }
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  const currentWidth = isCustom ? customWidth : selectedDevice.width;
  const currentHeight = isCustom ? customHeight : selectedDevice.height;

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-medium mb-4">响应式设计测试工具</h3>
        
        <div className="space-y-4">
          {/* 设备选择 */}
          <div>
            <label className="block text-sm font-medium mb-2">选择设备</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {deviceProfiles.map((device) => (
                <button
                  key={device.name}
                  onClick={() => handleDeviceChange(device)}
                  className={`px-3 py-2 text-xs rounded-md transition-all ${!isCustom && selectedDevice.name === device.name ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
                >
                  {device.name}
                </button>
              ))}
            </div>
          </div>

          {/* 自定义尺寸 */}
          <div>
            <label className="block text-sm font-medium mb-2">自定义尺寸</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(Number(e.target.value))}
                onBlur={handleCustomSizeChange}
                className="flex-1 px-3 py-2 border rounded-md"
                placeholder="宽度"
                min={100}
                max={4000}
              />
              <span className="flex items-center">×</span>
              <input
                type="number"
                value={customHeight}
                onChange={(e) => setCustomHeight(Number(e.target.value))}
                onBlur={handleCustomSizeChange}
                className="flex-1 px-3 py-2 border rounded-md"
                placeholder="高度"
                min={100}
                max={4000}
              />
              <button
                onClick={handleOrientationToggle}
                className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-md"
                aria-label="切换方向"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="4 16 12 8 20 16"></polyline>
                  <line x1="12" y1="8" x2="12" y2="20"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* 测试区域 */}
          <div className={`relative border rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 m-0' : ''}`}>
            <div className="bg-muted px-4 py-2 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="text-sm font-medium">
                {isCustom ? '自定义尺寸' : selectedDevice.name} ({currentWidth}×{currentHeight})
              </div>
              <button
                onClick={handleFullscreenToggle}
                className="p-1 hover:bg-muted/80 rounded"
                aria-label={isFullscreen ? '退出全屏' : '进入全屏'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {isFullscreen ? (
                    <>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <polyline points="9 21 3 21 3 15"></polyline>
                      <line x1="21" y1="3" x2="14" y2="10"></line>
                      <line x1="3" y1="21" x2="10" y2="14"></line>
                    </>
                  ) : (
                    <>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <polyline points="9 21 3 21 3 15"></polyline>
                      <line x1="21" y1="3" x2="14" y2="10"></line>
                      <line x1="3" y1="21" x2="10" y2="14"></line>
                    </>
                  )}
                </svg>
              </button>
            </div>
            <div 
              className="relative" 
              style={{ 
                width: `${currentWidth}px`, 
                height: `${currentHeight}px`,
                maxWidth: '100%',
                overflow: 'auto'
              }}
            >
              <iframe
                ref={iframeRef}
                src={targetUrl}
                className="w-full h-full border-0"
                title="Responsive Test"
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
            </div>
          </div>

          {/* 测试提示 */}
          <div className="bg-info/10 border border-info/20 rounded-md p-4">
            <h4 className="text-sm font-medium mb-1">测试提示</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• 测试不同设备尺寸下的布局表现</li>
              <li>• 检查导航菜单在小屏幕上是否正常显示</li>
              <li>• 验证表单元素在不同设备上的可用性</li>
              <li>• 测试图片和媒体内容的响应式表现</li>
              <li>• 确保文字大小在各种设备上都清晰可读</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
