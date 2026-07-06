CREATE DATABASE IF NOT EXISTS amarsheba
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE amarsheba;

SET NAMES utf8mb4;

DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS email_verification_otps;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE email_verification_otps (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  email VARCHAR(190) NOT NULL,
  otp_hash VARCHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_email_verification_otps_user_id (user_id),
  KEY idx_email_verification_otps_email (email),
  CONSTRAINT fk_email_verification_otps_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE services (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  title_en VARCHAR(180) NOT NULL,
  title_bn VARCHAR(180) NOT NULL,
  category VARCHAR(120) NOT NULL,
  description_en TEXT NOT NULL,
  description_bn TEXT NOT NULL,
  required_documents TEXT DEFAULT NULL,
  fee VARCHAR(120) DEFAULT NULL,
  processing_time VARCHAR(120) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_services_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE applications (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  service_id INT UNSIGNED NOT NULL,
  status ENUM('pending', 'processing', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  note TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_applications_user_id (user_id),
  KEY idx_applications_service_id (service_id),
  CONSTRAINT fk_applications_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_applications_service
    FOREIGN KEY (service_id) REFERENCES services(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE contacts (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_contacts_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (name, email, phone, password, role, is_verified)
VALUES
  (
    'AmarSheba Admin',
    'admin@amarsheba.com',
    '01700000000',
    '$2a$10$02lh1ZFkb7Sf2tGkhVH1sOY4.2vshHR5n8ayp3no4W1Wr4Us4lumu',
    'admin',
    1
  );

INSERT INTO services (
  title_en,
  title_bn,
  category,
  description_en,
  description_bn,
  required_documents,
  fee,
  processing_time
)
VALUES
  (
    'National ID Correction',
    'জাতীয় পরিচয়পত্র সংশোধন',
    'Identity',
    'Update name, date of birth, address, or other NID information through the Election Commission process.',
    'নির্বাচন কমিশনের প্রক্রিয়ার মাধ্যমে নাম, জন্মতারিখ, ঠিকানা বা অন্যান্য এনআইডি তথ্য সংশোধন করুন।',
    'NID copy, birth certificate, supporting proof for requested correction, applicant photo',
    'As per official schedule',
    '7 to 21 working days'
  ),
  (
    'e-Passport Application',
    'ই-পাসপোর্ট আবেদন',
    'Passport',
    'Apply for a new e-passport or renew an existing passport with appointment and fee guidance.',
    'নতুন ই-পাসপোর্টের জন্য আবেদন করুন অথবা অ্যাপয়েন্টমেন্ট ও ফি নির্দেশনাসহ বিদ্যমান পাসপোর্ট নবায়ন করুন।',
    'NID or birth certificate, previous passport if applicable, payment receipt, appointment slip',
    'Varies by delivery type',
    '7 to 30 working days'
  ),
  (
    'Driving License Application',
    'ড্রাইভিং লাইসেন্স আবেদন',
    'Driving License',
    'Complete learner permit, medical, test, and BRTA smart card steps for a driving license.',
    'ড্রাইভিং লাইসেন্সের জন্য লার্নার পারমিট, মেডিকেল, পরীক্ষা এবং বিআরটিএ স্মার্ট কার্ডের ধাপ সম্পন্ন করুন।',
    'NID, learner permit, medical certificate, training certificate, payment receipt',
    'As per BRTA fees',
    '15 to 45 working days'
  ),
  (
    'Land Mutation Service',
    'ভূমি নামজারি সেবা',
    'Land',
    'Apply for land mutation and ownership record updates with required deed and khatian documents.',
    'প্রয়োজনীয় দলিল ও খতিয়ান নথি দিয়ে ভূমি নামজারি ও মালিকানা রেকর্ড হালনাগাদের জন্য আবেদন করুন।',
    'Deed copy, khatian, tax receipt, applicant NID, authorization if applicable',
    'Depends on local office rules',
    '10 to 30 working days'
  ),
  (
    'Police Clearance Certificate',
    'পুলিশ ক্লিয়ারেন্স সনদ',
    'Police',
    'Request a police clearance certificate for travel, jobs, or visa processing.',
    'ভ্রমণ, চাকরি বা ভিসা প্রক্রিয়ার জন্য পুলিশ ক্লিয়ারেন্স সনদের আবেদন করুন।',
    'Passport copy, NID, address proof, photo, application form',
    'Official police clearance fee',
    '7 to 15 working days'
  ),
  (
    'Tax Identification Number',
    'কর শনাক্তকরণ নম্বর',
    'Tax',
    'Register for e-TIN and begin taxpayer profile setup through the NBR portal.',
    'এনবিআর পোর্টালের মাধ্যমে ই-টিআইএন নিবন্ধন করুন এবং করদাতা প্রোফাইল সেটআপ শুরু করুন।',
    'NID, mobile number, email, address details',
    'No registration fee',
    'Same day to 2 working days'
  );

/*
  Seeded admin account
  Email: admin@amarsheba.com
  Password: admin123
*/
