<?php
/**
 * RingBuz Theme Functions
 */

// Add theme support
function ringbuz_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption'));
    
    // Register menus
    register_nav_menus(array(
        'primary' => __('Primary Menu', 'ringbuz'),
        'footer' => __('Footer Menu', 'ringbuz')
    ));
}
add_action('after_setup_theme', 'ringbuz_setup');

// Enqueue scripts and styles
function ringbuz_scripts() {
    wp_enqueue_style('ringbuz-style', get_stylesheet_uri());
    wp_enqueue_style('tailwind', get_template_directory_uri() . '/assets/css/tailwind.min.css');
    wp_enqueue_script('ringbuz-script', get_template_directory_uri() . '/assets/js/main.js', array(), '1.0.0', true);
    
    // Localize script with site data
    wp_localize_script('ringbuz-script', 'ringbuzData', array(
        'ajaxurl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('ringbuz-nonce')
    ));
}
add_action('wp_enqueue_scripts', 'ringbuz_scripts');

// Custom post types
function ringbuz_register_post_types() {
    // Wallpapers
    register_post_type('wallpaper', array(
        'labels' => array(
            'name' => __('Wallpapers', 'ringbuz'),
            'singular_name' => __('Wallpaper', 'ringbuz')
        ),
        'public' => true,
        'has_archive' => true,
        'supports' => array('title', 'editor', 'thumbnail', 'custom-fields'),
        'rewrite' => array('slug' => 'wallpapers'),
        'show_in_rest' => true
    ));
    
    // Ringtones
    register_post_type('ringtone', array(
        'labels' => array(
            'name' => __('Ringtones', 'ringbuz'),
            'singular_name' => __('Ringtone', 'ringbuz')
        ),
        'public' => true,
        'has_archive' => true,
        'supports' => array('title', 'editor', 'thumbnail', 'custom-fields'),
        'rewrite' => array('slug' => 'ringtones'),
        'show_in_rest' => true
    ));
}
add_action('init', 'ringbuz_register_post_types');

// Custom taxonomies
function ringbuz_register_taxonomies() {
    // Categories for wallpapers
    register_taxonomy('wallpaper_category', 'wallpaper', array(
        'labels' => array(
            'name' => __('Wallpaper Categories', 'ringbuz'),
            'singular_name' => __('Wallpaper Category', 'ringbuz')
        ),
        'hierarchical' => true,
        'show_in_rest' => true,
        'rewrite' => array('slug' => 'wallpaper-category')
    ));
    
    // Categories for ringtones
    register_taxonomy('ringtone_category', 'ringtone', array(
        'labels' => array(
            'name' => __('Ringtone Categories', 'ringbuz'),
            'singular_name' => __('Ringtone Category', 'ringbuz')
        ),
        'hierarchical' => true,
        'show_in_rest' => true,
        'rewrite' => array('slug' => 'ringtone-category')
    ));
    
    // Tags for both
    register_taxonomy('content_tag', array('wallpaper', 'ringtone'), array(
        'labels' => array(
            'name' => __('Tags', 'ringbuz'),
            'singular_name' => __('Tag', 'ringbuz')
        ),
        'hierarchical' => false,
        'show_in_rest' => true,
        'rewrite' => array('slug' => 'tag')
    ));
}
add_action('init', 'ringbuz_register_taxonomies');

// Custom meta boxes
function ringbuz_add_meta_boxes() {
    // Wallpaper meta box
    add_meta_box(
        'wallpaper_meta',
        __('Wallpaper Details', 'ringbuz'),
        'ringbuz_wallpaper_meta_callback',
        'wallpaper'
    );
    
    // Ringtone meta box
    add_meta_box(
        'ringtone_meta',
        __('Ringtone Details', 'ringbuz'),
        'ringbuz_ringtone_meta_callback',
        'ringtone'
    );
}
add_action('add_meta_boxes', 'ringbuz_add_meta_boxes');

// Wallpaper meta box callback
function ringbuz_wallpaper_meta_callback($post) {
    wp_nonce_field('ringbuz_wallpaper_meta', 'ringbuz_wallpaper_meta_nonce');
    
    $dimensions = get_post_meta($post->ID, '_wallpaper_dimensions', true);
    $downloads = get_post_meta($post->ID, '_download_count', true) ?: 0;
    
    ?>
    <p>
        <label for="wallpaper_dimensions"><?php _e('Dimensions:', 'ringbuz'); ?></label>
        <input type="text" id="wallpaper_dimensions" name="wallpaper_dimensions" value="<?php echo esc_attr($dimensions); ?>" />
    </p>
    <p>
        <label for="download_count"><?php _e('Download Count:', 'ringbuz'); ?></label>
        <input type="number" id="download_count" name="download_count" value="<?php echo esc_attr($downloads); ?>" />
    </p>
    <?php
}

// Ringtone meta box callback
function ringbuz_ringtone_meta_callback($post) {
    wp_nonce_field('ringbuz_ringtone_meta', 'ringbuz_ringtone_meta_nonce');
    
    $duration = get_post_meta($post->ID, '_ringtone_duration', true);
    $downloads = get_post_meta($post->ID, '_download_count', true) ?: 0;
    
    ?>
    <p>
        <label for="ringtone_duration"><?php _e('Duration (seconds):', 'ringbuz'); ?></label>
        <input type="number" step="0.1" id="ringtone_duration" name="ringtone_duration" value="<?php echo esc_attr($duration); ?>" />
    </p>
    <p>
        <label for="download_count"><?php _e('Download Count:', 'ringbuz'); ?></label>
        <input type="number" id="download_count" name="download_count" value="<?php echo esc_attr($downloads); ?>" />
    </p>
    <?php
}

// Save meta box data
function ringbuz_save_meta_box_data($post_id) {
    // Verify nonces and permissions
    if (!isset($_POST['ringbuz_wallpaper_meta_nonce']) && !isset($_POST['ringbuz_ringtone_meta_nonce'])) {
        return;
    }
    
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    // Save wallpaper meta
    if (isset($_POST['wallpaper_dimensions'])) {
        update_post_meta($post_id, '_wallpaper_dimensions', sanitize_text_field($_POST['wallpaper_dimensions']));
    }
    
    // Save ringtone meta
    if (isset($_POST['ringtone_duration'])) {
        update_post_meta($post_id, '_ringtone_duration', floatval($_POST['ringtone_duration']));
    }
    
    // Save download count
    if (isset($_POST['download_count'])) {
        update_post_meta($post_id, '_download_count', intval($_POST['download_count']));
    }
}
add_action('save_post', 'ringbuz_save_meta_box_data');

// AJAX handlers for downloads
function ringbuz_handle_download() {
    check_ajax_referer('ringbuz-nonce', 'nonce');
    
    $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
    if (!$post_id) {
        wp_send_json_error('Invalid post ID');
    }
    
    // Increment download count
    $downloads = get_post_meta($post_id, '_download_count', true) ?: 0;
    update_post_meta($post_id, '_download_count', $downloads + 1);
    
    // Get file URL
    $file_url = get_post_meta($post_id, '_file_url', true);
    if (!$file_url) {
        $file_url = wp_get_attachment_url(get_post_thumbnail_id($post_id));
    }
    
    wp_send_json_success(array('url' => $file_url));
}
add_action('wp_ajax_ringbuz_download', 'ringbuz_handle_download');
add_action('wp_ajax_nopriv_ringbuz_download', 'ringbuz_handle_download');

// Add custom image sizes
add_image_size('wallpaper-thumbnail', 300, 300, true);
add_image_size('wallpaper-medium', 600, 600, true);
add_image_size('wallpaper-large', 1200, 1200, false);

// Add theme options page
function ringbuz_add_admin_menu() {
    add_menu_page(
        __('RingBuz Settings', 'ringbuz'),
        __('RingBuz', 'ringbuz'),
        'manage_options',
        'ringbuz-settings',
        'ringbuz_settings_page',
        'dashicons-admin-generic'
    );
}
add_action('admin_menu', 'ringbuz_add_admin_menu');

// Theme settings page
function ringbuz_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    
    if (isset($_POST['ringbuz_settings_nonce']) && wp_verify_nonce($_POST['ringbuz_settings_nonce'], 'ringbuz_save_settings')) {
        // Save settings
        update_option('ringbuz_google_analytics', sanitize_text_field($_POST['google_analytics']));
        update_option('ringbuz_adsense_code', wp_kses_post($_POST['adsense_code']));
        update_option('ringbuz_header_scripts', wp_kses_post($_POST['header_scripts']));
    }
    
    $google_analytics = get_option('ringbuz_google_analytics', '');
    $adsense_code = get_option('ringbuz_adsense_code', '');
    $header_scripts = get_option('ringbuz_header_scripts', '');
    
    ?>
    <div class="wrap">
        <h1><?php _e('RingBuz Theme Settings', 'ringbuz'); ?></h1>
        <form method="post">
            <?php wp_nonce_field('ringbuz_save_settings', 'ringbuz_settings_nonce'); ?>
            
            <table class="form-table">
                <tr>
                    <th scope="row"><?php _e('Google Analytics ID', 'ringbuz'); ?></th>
                    <td>
                        <input type="text" name="google_analytics" value="<?php echo esc_attr($google_analytics); ?>" class="regular-text" />
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php _e('AdSense Code', 'ringbuz'); ?></th>
                    <td>
                        <textarea name="adsense_code" rows="5" class="large-text"><?php echo esc_textarea($adsense_code); ?></textarea>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php _e('Header Scripts', 'ringbuz'); ?></th>
                    <td>
                        <textarea name="header_scripts" rows="5" class="large-text"><?php echo esc_textarea($header_scripts); ?></textarea>
                    </td>
                </tr>
            </table>
            
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}