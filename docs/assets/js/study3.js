/* Study 3 outputs: transcribed from the January–August 2025 progress report
   (Progress Report_Core_Funded_Development of land use suitability models_rev2).
   Tables 1 and 2 were images in the report and are re-typed here verbatim.
   Blank cells (null) = not produced by the method (deterministic methods give no prediction standard errors). */
window.STUDY3 = {
  period: 'January – August 2025',
  variables: {
    precip: {
      label: 'Annual precipitation',
      unit: 'mm',
      decimals: 3,
      map: 'assets/img/study3/annual-precipitation-ebk.jpg',
      mapAlt: 'Map of the Philippines by province showing interpolated annual precipitation from about 1,034 mm (blue, southern Palawan and southern Mindanao) to 4,115 mm (red, eastern Luzon, Samar and eastern Mindanao)',
      mapCaption: 'Interpolated annual precipitation (mm) from PAGASA climatological normals using Empirical Bayesian Kriging (Advanced), with provincial boundaries. Basemap: Earthstar Geographics.',
      tableCaption: 'Error estimates of tested interpolation methods for annual precipitation (cross-validation).',
      legend: [
        ['1,033.913 – 1,511.363'], ['1,511.364 – 1,825.151'], ['1,825.152 – 2,031.378'], ['2,031.379 – 2,166.914'], ['2,166.915 – 2,255.990'],
        ['2,255.991 – 2,391.525'], ['2,391.526 – 2,597.752'], ['2,597.753 – 2,911.540'], ['2,911.541 – 3,388.990'], ['3,388.991 – 4,115.463']
      ],
      highlights: [
        'Best-performing method: Empirical Bayesian Kriging (Advanced).',
        'RMSE = 684.883 mm, the lowest error across the 14 tested models.',
        'Percent error reduction = 19.04%, the largest improvement among methods.',
        'Mean standardized error close to zero (−0.013), indicating unbiased predictions.',
        'Drier regions (1,033–1,825 mm) appear in southern Palawan and parts of western and southern Mindanao.',
        'Wetter provinces (> 3,389 mm) concentrate along the eastern seaboard: eastern Luzon, Samar and eastern Mindanao.'
      ],
      rows: [
        ['Empirical Bayesian Kriging – Advanced', 'EBK', 1, 684.883, -6.904, -0.013, 0.995, 683.299, 2126.847, 19.035],
        ['Ordinary Kriging – Optimized', 'OK', 2, 707.453, -21.635, -0.027, 0.967, 723.282, 2365.827, 16.367],
        ['Ordinary Kriging – Default', 'OK', 3, 709.232, -21.621, -0.027, 0.962, 728.795, 2363.907, 16.156],
        ['Radial Basis Functions – Spline with tension', 'RBF', 4, 712.955, 3.632, null, null, null, 2369.767, 15.716],
        ['Empirical Bayesian Kriging – Default', 'EBK', 5, 714.213, 4.663, 0.006, 0.991, 715.247, 2390.993, 15.567],
        ['Radial Basis Functions – Completely regularized spline', 'RBF', 6, 714.679, 8.543, null, null, null, 2378.855, 15.512],
        ['Radial Basis Functions – Multiquadric', 'RBF', 7, 726.467, -3.043, null, null, null, 2244.826, 14.119],
        ['Radial Basis Functions – Inverse multiquadric', 'RBF', 8, 726.475, 15.659, null, null, null, 2412.873, 14.118],
        ['Inverse Distance Weighted – Optimized', 'IDW', 9, 733.735, -13.523, null, null, null, 2422.544, 13.260],
        ['Inverse Distance Weighted – Default', 'IDW', 10, 733.742, -13.142, null, null, null, 2422.195, 13.259],
        ['Kernel Interpolation', 'KI', 11, 737.362, 66.635, 0.091, 1.035, 700.673, 2058.132, 12.831],
        ['Global Polynomial Interpolation – Third order', 'GPI', 12, 763.016, -24.036, null, null, null, 2151.468, 9.798],
        ['Global Polynomial Interpolation – Second order', 'GPI', 13, 765.432, 17.526, null, null, null, 2222.464, 9.512],
        ['Radial Basis Functions – Thin plate spline', 'RBF', 14, 797.487, -3.922, null, null, null, 2217.158, 5.723]
      ]
    },
    temp: {
      label: 'Mean temperature',
      unit: '°C',
      decimals: 4,
      map: 'assets/img/study3/mean-temperature-ebk.jpg',
      mapAlt: 'Map of the Philippines by province showing interpolated mean temperature from about 25.4 °C (blue, northern Luzon) to 28.7 °C (red, Palawan, Sulu and western Mindanao)',
      mapCaption: 'Interpolated mean temperature (°C) from PAGASA climatological normals using Empirical Bayesian Kriging (Advanced), with provincial boundaries. Basemap: Earthstar Geographics.',
      tableCaption: 'Error estimates of tested interpolation methods for mean temperature (cross-validation).',
      legend: [
        ['25.395 – 26.705'], ['26.706 – 27.282'], ['27.283 – 27.537'], ['27.538 – 27.649'], ['27.650 – 27.698'],
        ['27.699 – 27.720'], ['27.721 – 27.769'], ['27.770 – 27.881'], ['27.882 – 28.136'], ['28.137 – 28.713']
      ],
      highlights: [
        'Best-performing method: Empirical Bayesian Kriging (Advanced).',
        'RMSE = 1.4170 °C, the lowest among the 14 tested models.',
        'Percent error reduction = 5.88%, outperforming all other approaches.',
        'Minimal bias (ME = −0.1110 °C) and near-ideal RMSSE (1.0467).',
        'Cooler temperatures (~25.4–26.7 °C) concentrate in northern Luzon and high-elevation areas.',
        'Warmer temperatures (> 28.1 °C) dominate southern Mindanao and island provinces such as Palawan and Sulu.'
      ],
      rows: [
        ['Empirical Bayesian Kriging – Advanced', 'EBK', 1, 1.4170, -0.1110, -0.0444, 1.0467, 1.5181, 7.5448, 5.8813],
        ['Radial Basis Functions – Inverse multiquadric', 'RBF', 2, 1.4694, -0.0133, null, null, null, 7.8259, 2.4000],
        ['Inverse Distance Weighted – Optimized', 'IDW', 3, 1.4789, -0.0110, null, null, null, 7.9144, 1.7648],
        ['Kernel Interpolation', 'KI', 4, 1.4917, 0.0243, 0.0160, 0.9227, 1.7051, 8.0665, 0.9167],
        ['Ordinary Kriging – Optimized', 'OK', 5, 1.4918, -0.0560, -0.0358, 0.9306, 1.6178, 7.8700, 0.9100],
        ['Radial Basis Functions – Spline with tension', 'RBF', 6, 1.4934, -0.0180, null, null, null, 7.9079, 0.8013],
        ['Radial Basis Functions – Completely regularized spline', 'RBF', 7, 1.4985, -0.0161, null, null, null, 7.9231, 0.4688],
        ['Global Polynomial Interpolation – Second order', 'GPI', 8, 1.5066, 0.0264, null, null, null, 7.8273, -0.0749],
        ['Ordinary Kriging – Default', 'OK', 9, 1.5093, -0.0214, -0.0148, 1.0257, 1.4759, 7.8602, -0.2494],
        ['Empirical Bayesian Kriging – Default', 'EBK', 10, 1.5098, -0.0457, -0.0296, 1.0001, 1.5184, 7.8269, -0.2850],
        ['Inverse Distance Weighted – Default', 'IDW', 11, 1.5424, -0.0146, null, null, null, 8.0724, -2.4515],
        ['Radial Basis Functions – Multiquadric', 'RBF', 12, 1.6642, -0.0015, null, null, null, 8.1097, -10.5426],
        ['Global Polynomial Interpolation – Third order', 'GPI', 13, 1.7930, 0.1140, null, null, null, 8.0400, -19.0972],
        ['Radial Basis Functions – Thin plate spline', 'RBF', 14, 1.9120, 0.0401, null, null, null, 8.0695, -27.0025]
      ]
    }
  },
  columns: [
    ['Model description', ''], ['Rank', ''], ['RMSE', 'Root mean square error'], ['ME', 'Mean error'],
    ['MSE', 'Mean standardized error'], ['RMSSE', 'Root mean square standardized error'], ['ASE', 'Average standard error'],
    ['Max |error|', 'Maximum absolute error'], ['Error reduction (%)', 'Percent error reduction']
  ],
  families: {
    EBK: 'Empirical Bayesian Kriging', OK: 'Ordinary Kriging', RBF: 'Radial Basis Functions',
    IDW: 'Inverse Distance Weighted', KI: 'Kernel Interpolation', GPI: 'Global Polynomial Interpolation'
  },
  geostatistical: ['EBK', 'OK']
};
