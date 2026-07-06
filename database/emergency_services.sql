CREATE TABLE IF NOT EXISTS emergency_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  description TEXT NOT NULL,
  district VARCHAR(80) DEFAULT 'National',
  address VARCHAR(255),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO emergency_services (name, category, phone, description, district, address, latitude, longitude, is_active) VALUES
('National Emergency 999', 'National Emergency', '999', 'Police, fire, and ambulance emergency support across Bangladesh.', 'National', 'Nationwide emergency response', 23.8103000, 90.4125000, 1),
('Fire Service and Civil Defence', 'Fire Service', '16163', 'Fire, rescue, and civil defence emergency support.', 'National', 'Nearest fire service station', 23.7275000, 90.4015000, 1),
('Police Emergency', 'Police', '999', 'Immediate law-enforcement support and incident reporting.', 'National', 'Nearest police station or national emergency desk', 23.8103000, 90.4125000, 1),
('Ambulance Service', 'Ambulance', '16263', 'Medical transport and urgent patient transfer support.', 'Dhaka', 'Dhaka city emergency medical transport desk', 23.7806000, 90.2792000, 1),
('Blood Donation Support', 'Blood Donation', '16263', 'Urgent blood donor and transfusion support information.', 'National', 'Blood donation and hospital support network', 23.8103000, 90.4125000, 1),
('Hospital Emergency', 'Hospital Emergency', '10655', 'Emergency hospital care, admission, and critical patient support.', 'Dhaka', 'Nearest public hospital emergency department', 23.7381000, 90.3964000, 1),
('Gas Emergency', 'Gas Emergency', '16496', 'Gas leak, supply interruption, and pipeline hazard reporting.', 'National', 'Gas distribution emergency desk', 23.8103000, 90.4125000, 1),
('Electricity Emergency', 'Electricity Emergency', '16116', 'Power outage, fallen line, transformer, and electricity complaint support.', 'National', 'Electricity provider emergency desk', 23.8103000, 90.4125000, 1);
