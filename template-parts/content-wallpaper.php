<?php
/**
 * Template part for displaying wallpapers
 */
?>
<article id="post-<?php the_ID(); ?>" <?php post_class('group relative'); ?>>
    <a href="<?php the_permalink(); ?>" class="block">
        <div class="aspect-square rounded-2xl overflow-hidden bg-gray-800">
            <?php if (has_post_thumbnail()): ?>
                <?php the_post_thumbnail('wallpaper-thumbnail', array(
                    'class' => 'w-full h-full object-cover transition-transform group-hover:scale-110'
                )); ?>
            <?php endif; ?>
        </div>
    </a>

    <div class="mt-3">
        <a href="<?php the_permalink(); ?>" class="text-white hover:text-pink-400 transition-colors line-clamp-1">
            <?php the_title(); ?>
        </a>
        <div class="flex items-center justify-between mt-1">
            <a href="<?php echo esc_url(get_author_posts_url(get_the_author_meta('ID'))); ?>" 
               class="flex items-center text-sm text-gray-400 hover:text-pink-400 transition-colors">
                <i data-lucide="user" class="w-3.5 h-3.5 mr-1"></i>
                <?php the_author(); ?>
            </a>
            <div class="flex items-center gap-2">
                <div class="text-sm text-gray-400">
                    <i data-lucide="download" class="w-3.5 h-3.5 inline mr-1"></i>
                    <?php echo number_format(get_post_meta(get_the_ID(), '_download_count', true) ?: 0); ?>
                </div>
            </div>
        </div>
    </div>
</article>