classDiagram
direction BT
class account_activation_tokens {
timestamp(6) created_at
timestamp(6) expires_at
varchar(128) token
boolean used
timestamp(6) used_at
bigint user_id
bigint id
}
class audit_logs {
varchar(100) action
bigint actor_user_id
timestamp(6) created_at
varchar(1000) description
varchar(100) ip_address
text new_value
text old_value
bigint target_id
varchar(50) target_type
varchar(1000) user_agent
bigint id
}
class cart_items {
timestamp(6) created_at
timestamp(6) updated_at
integer quantity
bigint product_id
bigint user_id
bigint id
}
class categories {
timestamp(6) created_at
timestamp(6) updated_at
varchar(50) code
varchar(1000) description
boolean is_active
varchar(200) name
bigint id
}
class device_condition_reports {
timestamp(6) created_at
timestamp(6) updated_at
text condition_notes
varchar(100) inspector_name
varchar(30) type
bigint device_id
bigint rental_order_id
bigint id
}
class devices {
timestamp(6) created_at
timestamp(6) updated_at
text condition_details
varchar(100) serial_number
varchar(30) status
bigint product_id
bigint id
}
class face_verification_results {
boolean face_match_passed
double precision face_match_score
double precision face_quality_score
boolean liveness_passed
double precision liveness_score
boolean multiple_faces_detected
timestamp(6) processed_at
boolean spoof_detected
bigint verification_session_id
bigint id
}
class inventory_audit_logs {
timestamp(6) created_at
timestamp(6) updated_at
integer new_stock
integer old_stock
text reason
varchar(255) stock_type
bigint changed_by
bigint product_id
bigint id
}
class order_items {
timestamp(6) created_at
timestamp(6) updated_at
integer quantity
varchar(255) size
numeric(12,2) subtotal
numeric(12,2) unit_price
bigint order_id
bigint product_id
bigint id
}
class orders {
timestamp(6) created_at
timestamp(6) updated_at
timestamp(6) canceled_at
varchar(50) code
timestamp(6) completed_at
timestamp(6) confirmed_at
timestamp(6) delivered_at
numeric(12,2) discount_amount
varchar(255) payment_method
oid payment_raw_payload
varchar(255) payment_response_code
varchar(255) payment_status
varchar(255) payment_transaction_no
timestamp(6) shipped_at
varchar(255) shipping_address
numeric(12,2) shipping_discount
numeric(12,2) shipping_fee
varchar(100) shipping_name
varchar(20) shipping_phone
varchar(255) shipping_voucher_code
varchar(255) status
numeric(12,2) total_price
varchar(255) voucher_code
bigint user_id
bigint id
}
class password_reset_tokens {
timestamp(6) created_at
timestamp(6) expires_at
varchar(12) otp_code
boolean used
timestamp(6) used_at
bigint user_id
bigint id
}
class payment_transaction_logs {
numeric(12,2) amount
timestamp(6) created_at
varchar(3) currency
varchar(255) note
varchar(100) order_code
varchar(30) provider
oid raw_payload
varchar(50) response_code
varchar(20) status
varchar(100) transaction_id
bigint order_id
bigint id
}
class permissions {
varchar(255) description
varchar(255) name
bigint id
}
class product_images {
timestamp(6) created_at
timestamp(6) updated_at
varchar(255) image_url
bigint product_id
bigint id
}
class product_price_histories {
timestamp(6) created_at
timestamp(6) updated_at
numeric(38,2) new_price
numeric(38,2) old_price
varchar(255) price_type
bigint changed_by
bigint product_id
bigint id
}
class product_specifications {
varchar(255) spec_key
text spec_value
bigint product_id
bigint id
}
class products {
timestamp(6) created_at
timestamp(6) updated_at
varchar(255) brand
timestamp(6) deleted_at
text description
boolean is_active
boolean is_for_rent
boolean is_for_sale
varchar(255) main_image_url
varchar(255) name
integer quantity
numeric(3,2) rating_average
numeric(38,2) rent_price_per_day
integer rental_quantity
integer review_count
numeric(38,2) sale_price
bigint category_id
bigint id
}
class refresh_tokens {
timestamp(6) created_at
timestamp(6) expires_at
boolean revoked
timestamp(6) revoked_at
varchar(255) token
bigint user_id
bigint id
}
class rental_contracts {
timestamp(6) created_at
timestamp(6) updated_at
varchar(255) contract_hash
varchar(100) contract_number
integer contract_version
timestamp(6) generated_at
boolean is_locked
varchar(255) lessor_signature
timestamp(6) lessor_signed_at
timestamp(6) signed_at
varchar(50) signer_ip
bigint signer_user_id
varchar(6) signing_otp_code
timestamp(6) signing_otp_expires_at
varchar(30) status
text terms_and_conditions
bigint rental_order_id
bigint id
}
class rental_handover_reports {
timestamp(6) created_at
timestamp(6) updated_at
varchar(255) accessory_condition
varchar(255) battery_condition
varchar(255) body_condition
varchar(30) deposit_payment_method
numeric(12,2) final_deposit_amount
varchar(255) lens_condition
text note
varchar(30) risk_level
varchar(100) serial_number
bigint rental_order_id
bigint staff_id
bigint id
}
class rental_order_items {
text condition_after_return
text condition_before_handover
numeric(12,2) price_per_day
bigint device_id
bigint product_id
bigint rental_order_id
bigint id
}
class rental_orders {
timestamp(6) created_at
timestamp(6) updated_at
numeric(12,2) additional_fee
timestamp(6) canceled_at
varchar(50) code
timestamp(6) completed_at
varchar(30) deposit_status
timestamp(6) end_date
numeric(12,2) estimated_deposit_amount
numeric(12,2) final_deposit_amount
timestamp(6) handed_over_at
varchar(30) payment_method
oid payment_raw_payload
varchar(255) payment_response_code
varchar(30) payment_status
varchar(255) payment_transaction_no
varchar(30) refund_status
numeric(12,2) rental_fee
timestamp(6) returned_at
varchar(30) risk_level
varchar(255) shipping_address
varchar(100) shipping_name
varchar(20) shipping_phone
timestamp(6) start_date
varchar(30) status
bigint user_id
bigint id
}
class rental_payments {
timestamp(6) created_at
timestamp(6) updated_at
numeric(12,2) amount
timestamp(6) paid_at
varchar(30) payment_method
varchar(30) payment_type
varchar(30) status
varchar(100) transaction_code
bigint rental_order_id
bigint id
}
class rental_refunds {
timestamp(6) created_at
timestamp(6) updated_at
numeric(12,2) amount
text note
varchar(30) refund_method
timestamp(6) refunded_at
varchar(30) status
bigint rental_order_id
bigint id
}
class rental_return_reports {
timestamp(6) created_at
timestamp(6) updated_at
varchar(255) accessory_condition_after
varchar(255) battery_condition_after
varchar(255) body_condition_after
numeric(12,2) damage_fee
numeric(12,2) extra_payment_amount
integer late_days
numeric(12,2) late_fee
varchar(255) lens_condition_after
numeric(12,2) missing_accessory_fee
text note
numeric(12,2) refund_amount
timestamp(6) return_date
numeric(12,2) total_penalty
bigint rental_order_id
bigint staff_id
bigint id
}
class review_images {
varchar(255) image_url
bigint review_id
bigint id
}
class review_reporters {
bigint review_id
bigint user_id
}
class reviews {
timestamp(6) created_at
timestamp(6) updated_at
text content
boolean hidden
integer rating
bigint order_id
bigint product_id
bigint user_id
bigint id
}
class risk_assessments {
boolean blacklist_hit
boolean device_fingerprint_match
boolean ip_risk_flag
boolean manual_review_required
timestamp(6) processed_at
varchar(1000) reason
varchar(20) risk_level
double precision risk_score
bigint verification_session_id
bigint id
}
class role_permissions {
bigint role_id
bigint permission_id
}
class roles {
varchar(255) code
varchar(255) description
bigint id
}
class shipping_addresses {
timestamp(6) created_at
timestamp(6) updated_at
varchar(500) detail_address
varchar(255) district
varchar(500) full_address
boolean is_default
varchar(255) province
varchar(255) receiver_name
varchar(255) receiver_phone
varchar(255) ward
bigint user_id
bigint id
}
class support_tickets {
timestamp(6) created_at
timestamp(6) updated_at
varchar(100) email
text internal_note
text message
varchar(100) name
varchar(20) phone
text reply_message
timestamp(6) resolved_at
varchar(50) status
varchar(50) subject
bigint processed_by_id
bigint id
}
class user_identities {
timestamp(6) created_at
timestamp(6) updated_at
date date_of_birth
varchar(30) document_type
date expiry_date
varchar(200) full_name
varchar(20) gender
varchar(50) identity_number
varchar(30) identity_verification_status
date issued_date
varchar(255) issued_place
boolean manual_verified
varchar(100) nationality
boolean ocr_extracted
varchar(255) place_of_origin
varchar(255) place_of_residence
timestamp(6) verified_at
bigint user_id
bigint id
}
class user_profiles {
timestamp(6) created_at
timestamp(6) updated_at
varchar(500) avatar_url
varchar(200) company_name
date date_of_birth
varchar(100) first_name
varchar(200) full_name
varchar(20) gender
varchar(100) last_name
varchar(150) occupation
bigint user_id
}
class user_roles {
bigint user_id
bigint role_id
}
class users {
timestamp(6) created_at
timestamp(6) updated_at
boolean account_non_locked
varchar(30) account_status
varchar(150) email
boolean email_verified
boolean enabled
integer failed_login_attempts
varchar(30) kyc_status
timestamp(6) last_login_at
timestamp(6) locked_until
varchar(255) password_hash
varchar(20) phone
boolean phone_verified
varchar(30) trust_level
bigint id
}
class verification_artifacts {
varchar(30) artifact_status
varchar(30) artifact_type
varchar(128) checksum
bigint file_size
varchar(100) mime_type
varchar(255) original_file_name
varchar(500) storage_key
timestamp(6) uploaded_at
bigint verification_session_id
bigint id
}
class verification_results {
varchar(50) decision_source
boolean document_tampered
boolean document_valid
date extracted_date_of_birth
date extracted_expiry_date
varchar(200) extracted_full_name
varchar(20) extracted_gender
varchar(50) extracted_identity_number
date extracted_issued_date
varchar(100) extracted_nationality
varchar(255) extracted_place_of_origin
varchar(255) extracted_place_of_residence
boolean fields_match_profile
double precision ocr_confidence
varchar(100) ocr_provider
timestamp(6) processed_at
text raw_ocr_json
bigint verification_session_id
bigint id
}
class verification_reviews {
varchar(1000) note
varchar(30) review_action
timestamp(6) reviewed_at
bigint reviewer_id
bigint verification_session_id
bigint id
}
class verification_sessions {
timestamp(6) created_at
timestamp(6) updated_at
timestamp(6) completed_at
varchar(1000) failure_reason
varchar(1000) review_note
timestamp(6) started_at
varchar(30) status
timestamp(6) submitted_at
varchar(30) verification_type
bigint user_id
bigint id
}
class vouchers {
timestamp(6) created_at
timestamp(6) updated_at
varchar(50) code
text description
numeric(12,2) discount_value
timestamp(6) end_date
numeric(12,2) max_discount_amount
integer max_usage
integer max_usage_per_user
numeric(12,2) min_order_value
varchar(100) name
varchar(255) scope
timestamp(6) start_date
varchar(255) status
varchar(255) type
integer used_count
bigint id
}

account_activation_tokens --> users : user_id:id
cart_items --> products : product_id:id
cart_items --> users : user_id:id
device_condition_reports --> devices : device_id:id
device_condition_reports --> rental_orders : rental_order_id:id
devices --> products : product_id:id
face_verification_results --> verification_sessions : verification_session_id:id
inventory_audit_logs --> products : product_id:id
inventory_audit_logs --> users : changed_by:id
order_items --> orders : order_id:id
order_items --> products : product_id:id
orders --> users : user_id:id
password_reset_tokens --> users : user_id:id
payment_transaction_logs --> orders : order_id:id
product_images --> products : product_id:id
product_price_histories --> products : product_id:id
product_price_histories --> users : changed_by:id
product_specifications --> products : product_id:id
products --> categories : category_id:id
refresh_tokens --> users : user_id:id
rental_contracts --> rental_orders : rental_order_id:id
rental_handover_reports --> rental_orders : rental_order_id:id
rental_handover_reports --> users : staff_id:id
rental_order_items --> devices : device_id:id
rental_order_items --> products : product_id:id
rental_order_items --> rental_orders : rental_order_id:id
rental_orders --> users : user_id:id
rental_payments --> rental_orders : rental_order_id:id
rental_refunds --> rental_orders : rental_order_id:id
rental_return_reports --> rental_orders : rental_order_id:id
rental_return_reports --> users : staff_id:id
review_images --> reviews : review_id:id
review_reporters --> reviews : review_id:id
review_reporters --> users : user_id:id
reviews --> orders : order_id:id
reviews --> products : product_id:id
reviews --> users : user_id:id
risk_assessments --> verification_sessions : verification_session_id:id
role_permissions --> permissions : permission_id:id
role_permissions --> roles : role_id:id
shipping_addresses --> users : user_id:id
support_tickets --> users : processed_by_id:id
user_identities --> users : user_id:id
user_profiles --> users : user_id:id
user_roles --> roles : role_id:id
user_roles --> users : user_id:id
verification_artifacts --> verification_sessions : verification_session_id:id
verification_results --> verification_sessions : verification_session_id:id
verification_reviews --> verification_sessions : verification_session_id:id
verification_sessions --> users : user_id:id
