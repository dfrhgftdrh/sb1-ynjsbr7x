<?php
/**
 * The main template file
 */
get_header();
?>

<div class="container mx-auto px-4">
    <?php if (have_posts()): ?>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <?php while (have_posts()): the_post(); ?>
                <?php get_template_part('template-parts/content', get_post_type()); ?>
            <?php endwhile; ?>
        </div>

        <?php the_posts_pagination(array(
            'prev_text' => '<i data-lucide="chevron-left"></i>',
            'next_text' => '<i data-lucide="chevron-right"></i>',
            'class' => 'mt-8'
        )); ?>
    <?php else: ?>
        <div class="text-center py-12">
            <p class="text-gray-400"><?php _e('No content found.', 'ringbuz'); ?></p>
        </div>
    <?php endif; ?>
</div>

<?php get_footer(); ?>