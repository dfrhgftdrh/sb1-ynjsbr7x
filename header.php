<?php
/**
 * The header template
 */
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?php wp_head(); ?>
    <?php echo get_option('ringbuz_header_scripts'); ?>
</head>
<body <?php body_class('bg-gradient-to-b from-[#1a1b2e] to-[#16172b] text-white min-h-screen'); ?>>
<?php wp_body_open(); ?>

<header class="fixed top-0 left-0 right-0 z-50 bg-[#1a1b2e]/95 backdrop-blur-lg border-b border-pink-500/20">
    <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16 md:h-20">
            <!-- Logo -->
            <?php if (has_custom_logo()): ?>
                <?php the_custom_logo(); ?>
            <?php else: ?>
                <a href="<?php echo esc_url(home_url('/')); ?>" class="flex items-center">
                    <div class="flex items-center gap-2">
                        <div class="relative">
                            <div class="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center transform -rotate-6 shadow-lg">
                                <i data-lucide="music" class="text-white"></i>
                            </div>
                            <div class="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <i data-lucide="volume-2" class="text-white w-2.5 h-2.5"></i>
                            </div>
                        </div>
                        <div class="ml-2">
                            <span class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-pink-600">
                                Ring<span class="text-blue-500">Buz</span>
                            </span>
                        </div>
                    </div>
                </a>
            <?php endif; ?>

            <!-- Navigation -->
            <nav class="hidden md:flex items-center space-x-6">
                <?php
                wp_nav_menu(array(
                    'theme_location' => 'primary',
                    'container' => false,
                    'menu_class' => 'flex items-center space-x-6',
                    'link_before' => '<span class="text-gray-300 hover:text-pink-500 transition-colors">',
                    'link_after' => '</span>'
                ));
                ?>
                
                <?php if (is_user_logged_in()): ?>
                    <a href="<?php echo esc_url(wp_logout_url(home_url())); ?>" class="text-gray-300 hover:text-pink-500 transition-colors">
                        <?php _e('Logout', 'ringbuz'); ?>
                    </a>
                <?php else: ?>
                    <a href="<?php echo esc_url(wp_login_url()); ?>" class="flex items-center px-6 py-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full hover:opacity-90 transition-all">
                        <i data-lucide="log-in" class="w-5 h-5 mr-2"></i>
                        <?php _e('Sign In', 'ringbuz'); ?>
                    </a>
                <?php endif; ?>
            </nav>

            <!-- Mobile menu button -->
            <button class="md:hidden p-2 text-gray-300 hover:text-white rounded-lg" aria-label="Menu">
                <i data-lucide="menu" class="w-6 h-6"></i>
            </button>
        </div>

        <!-- Search form -->
        <div class="py-2">
            <form role="search" method="get" action="<?php echo esc_url(home_url('/')); ?>" class="relative">
                <input type="search" name="s" placeholder="<?php esc_attr_e('Search wallpapers & ringtones...', 'ringbuz'); ?>"
                    class="w-full bg-gray-800 rounded-full px-5 py-2 pl-12 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                    value="<?php echo get_search_query(); ?>"
                />
                <i data-lucide="search" class="absolute left-4 top-2.5 text-gray-400 w-5 h-5"></i>
            </form>
        </div>
    </div>
</header>

<div class="pt-32"><!-- Content wrapper -->