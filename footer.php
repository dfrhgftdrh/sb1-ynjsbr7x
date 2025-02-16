<?php
/**
 * The footer template
 */
?>
</div><!-- End content wrapper -->

<footer class="bg-[#1a1b2e] mt-12 py-8 border-t border-pink-500/20">
    <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- About -->
            <div>
                <h3 class="text-lg font-semibold text-white mb-4"><?php _e('About RingBuz', 'ringbuz'); ?></h3>
                <p class="text-gray-400">
                    <?php echo get_bloginfo('description'); ?>
                </p>
            </div>

            <!-- Quick Links -->
            <div>
                <h3 class="text-lg font-semibold text-white mb-4"><?php _e('Quick Links', 'ringbuz'); ?></h3>
                <?php
                wp_nav_menu(array(
                    'theme_location' => 'footer',
                    'container' => false,
                    'menu_class' => 'space-y-2',
                    'link_before' => '<span class="text-gray-400 hover:text-pink-500 transition-colors">',
                    'link_after' => '</span>'
                ));
                ?>
            </div>

            <!-- Contact -->
            <div>
                <h3 class="text-lg font-semibold text-white mb-4"><?php _e('Contact Us', 'ringbuz'); ?></h3>
                <p class="text-gray-400">
                    <?php echo get_option('admin_email'); ?>
                </p>
            </div>
        </div>

        <div class="mt-8 pt-8 border-t border-pink-500/20 text-center text-gray-400">
            <p>&copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. <?php _e('All rights reserved.', 'ringbuz'); ?></p>
        </div>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>