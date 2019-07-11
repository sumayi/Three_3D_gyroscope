/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

THREE.DeviceOrientationControls = function (object) {

  var scope = this;
  this.object = object;
  this.object.rotation.reorder('YXZ');

  this.enabled = true;

  this.deviceOrientation = {};
  this.screenOrientation = 0;

  this.alphaOffset = 0; // radians

  var onDeviceOrientationChangeEvent = function (event) {

    scope.deviceOrientation = event;

  };

  var onScreenOrientationChangeEvent = function () {

    scope.screenOrientation = window.orientation || 0;

  };

  // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

  var setObjectQuaternion = function () {

    //Vector3对象的构造函数.用来创建一个三维向量的对象.Vector3对象的功能函数采用
    var zee = new THREE.Vector3(0, 0, 1);
    //欧拉角表示将一个几何体绕x轴旋转a度，绕y轴旋转b度，绕z轴旋转c度；并且旋转的顺序是xyz ; 第三个参数旋转顺序可以是’XYZ’, ‘YZX’, ‘ZXY’, ‘XZY’, ‘YXZ’, ‘ZYX’
    var euler = new THREE.Euler();
    // 执行一个四元数。这是用来旋转的东西
    var q0 = new THREE.Quaternion();

    var q1 = new THREE.Quaternion(- Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

    return function (quaternion, alpha, beta, gamma, orient) {

      euler.set(beta, alpha, - gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us

      quaternion.setFromEuler(euler); // orient the device
      // 摄像头从设备的后面看，而不是顶部
      quaternion.multiply(q1); // camera looks out the back of the device, not the top
      // 调整屏幕方向
      quaternion.multiply(q0.setFromAxisAngle(zee, - orient)); // adjust for screen orientation

    };

  }();

  this.connect = function () {

    onScreenOrientationChangeEvent(); // run once on load
    //在设备旋转的时候，会触发这个事件=>这个事件是苹果公司为safari中添加的
    window.addEventListener('orientationchange', onScreenOrientationChangeEvent, false);
    //相对设备方向更改的信息
    window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);

    scope.enabled = true;

  };

  this.disconnect = function () {

    window.removeEventListener('orientationchange', onScreenOrientationChangeEvent, false);
    window.removeEventListener('deviceorientation', onDeviceOrientationChangeEvent, false);

    scope.enabled = false;

  };

  this.update = function () {

    if (scope.enabled === false) return;

    var device = scope.deviceOrientation;

    if (device) {

      var alpha = device.alpha ? THREE.Math.degToRad(device.alpha) + scope.alphaOffset : 0; // Z

      var beta = device.beta ? THREE.Math.degToRad(device.beta) : 0; // X'

      var gamma = device.gamma ? THREE.Math.degToRad(device.gamma) : 0; // Y''

      var orient = scope.screenOrientation ? THREE.Math.degToRad(scope.screenOrientation) : 0; // O

      setObjectQuaternion(scope.object.quaternion, alpha, beta, gamma, orient);
      console.log(alpha,beta,gamma,orient)
    }


  };

  this.dispose = function () {

    scope.disconnect();

  };

  this.connect();

};
